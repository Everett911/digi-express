import {
  GoogleGenAI,
  ThinkingLevel,
  type Content,
  type FunctionDeclaration,
  type Part,
} from "@google/genai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createStorefrontServer } from "@/mcp/storefront-server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.5-flash";

const MAX_TOOL_ROUNDS = 5;
// Only the latest messages go to the model: older ones rarely matter for
// shopping questions, and every message is resent (and billed) on every call.
const MAX_HISTORY = 10;
const MAX_CARDS = 4;

const SYSTEM_PROMPT = `You are the shopping assistant for Digi-Express, an online store.
- Only help with the store's products, shipping and the customer's orders. Politely decline anything else.
- Always use the tools to find products. Never invent products, prices or stock.
- Prices from tools are in cents: 2500 means $25.00.
- When you recommend products, use their exact names. The chat shows a picture card for each one.
- Keep answers short and friendly.
- Reply in plain text, no markdown: no ** or *, use "- " for lists.`;

const SIGNED_IN = "- The customer is signed in. Use my-orders for questions about their orders.";
const SIGNED_OUT =
  "- The customer is not signed in. For questions about their orders, ask them to sign in first.";

export type ChatMessage = { role: "user" | "model"; text: string };

// A product the chat can show as a card next to the reply.
export type ProductCard = { id: string; name: string; priceCents: number; image: string | null };

type ToolProduct = { id: string; name: string; priceCents: number; image: string[] };

async function connectMcp(userId?: string) {
  const server = createStorefrontServer({ userId });
  const client = new Client({ name: "digi-express-chat", version: "1.0.0" });

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  return client;
}

function toGeminiTools(
  tools: { name: string; description?: string; inputSchema: object }[],
): FunctionDeclaration[] {
  return tools.map(({ name, description, inputSchema }) => {
    const { $schema: _schema, ...schema } = inputSchema as Record<string, unknown>;
    return { name, description, parametersJsonSchema: schema };
  });
}

function isProduct(value: unknown): value is ToolProduct {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    "priceCents" in value &&
    "image" in value
  );
}

// Tool results are pretty-printed JSON. The model gets them compacted and
// without image URLs (long, and useless to it); the products are remembered
// so the reply can show them as cards.
function prepareForModel(text: string, seen: Map<string, ProductCard>) {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return text;
  }

  const items = Array.isArray(data) ? data : [data];
  if (!items.every(isProduct)) return JSON.stringify(data);

  const stripped = items.map(({ image, ...product }) => {
    seen.set(product.id, {
      id: product.id,
      name: product.name,
      priceCents: product.priceCents,
      image: image[0] ?? null,
    });
    return product;
  });
  return JSON.stringify(Array.isArray(data) ? stripped : stripped[0]);
}

// Cards for the products the reply actually names, in the order it names them.
function cardsFor(reply: string, seen: Map<string, ProductCard>) {
  const text = reply.toLowerCase();
  return [...seen.values()]
    .map((card) => ({ card, at: text.indexOf(card.name.toLowerCase()) }))
    .filter(({ at }) => at !== -1)
    .sort((a, b) => a.at - b.at)
    .slice(0, MAX_CARDS)
    .map(({ card }) => card);
}

// The history must start with the customer, so drop a leading model reply
// that the trim may have left at the front.
function recentHistory(messages: ChatMessage[]) {
  const recent = messages.slice(-MAX_HISTORY);
  const firstUser = recent.findIndex((m) => m.role === "user");
  return firstUser === -1 ? recent : recent.slice(firstUser);
}

// userId comes from the session, so the order tools only ever see that
// customer's orders.
export async function runChat(messages: ChatMessage[], { userId }: { userId?: string } = {}) {
  const client = await connectMcp(userId);
  try {
    const { tools } = await client.listTools();
    const functionDeclarations = toGeminiTools(tools);
    const seen = new Map<string, ProductCard>();

    const contents: Content[] = recentHistory(messages).map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents,
        config: {
          systemInstruction: `${SYSTEM_PROMPT}\n${userId ? SIGNED_IN : SIGNED_OUT}`,
          tools: [{ functionDeclarations }],
          // Thinking tokens are billed as output; product lookups need little.
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const calls = response.functionCalls ?? [];

      if (calls.length === 0) {
        const reply = response.text ?? "Sorry, I didn't catch that.";
        return { reply, products: cardsFor(reply, seen) };
      }

      contents.push(response.candidates![0].content!);

      const resultParts: Part[] = await Promise.all(
        calls.map(async (call) => {
          const result = await client.callTool({
            name: call.name!,
            arguments: call.args ?? {},
          });

          const text = (result.content as { type: string; text?: string }[])
            .filter((block) => block.type === "text")
            .map((block) => block.text)
            .join("\n");

          return {
            functionResponse: {
              id: call.id,
              name: call.name,
              response: {
                result: prepareForModel(text, seen),
                isError: Boolean(result.isError),
              },
            },
          };
        }),
      );

      contents.push({ role: "user", parts: resultParts });
    }

    return {
      reply: "Sorry, that took too many steps. Could you ask more simply?",
      products: [],
    };
  } finally {
    await client.close();
  }
}
