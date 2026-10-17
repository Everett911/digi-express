import { GoogleGenAI, type Content, type FunctionDeclaration, type Part } from "@google/genai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createStorefrontServer } from "@/mcp/storefront-server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.5-flash";

const MAX_TOOL_ROUNDS = 5;

const SYSTEM_PROMPT = `You are the shopping assistant for Digi-Express, an online store.
- Only help with the store's products, shipping and the customer's orders. Politely decline anything else.
- Always use the tools to find products. Never invent products, prices or stock.
- Prices from tools are in cents: 2500 means $25.00.
- Keep answers short and friendly.
- Reply in plain text, no markdown: no ** or *, use "- " for lists.`;

const SIGNED_IN = "- The customer is signed in. Use my-orders for questions about their orders.";
const SIGNED_OUT =
  "- The customer is not signed in. For questions about their orders, ask them to sign in first.";

export type ChatMessage = { role: "user" | "model"; text: string };

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

// userId comes from the session, so the order tools only ever see that
// customer's orders.
export async function runChat(messages: ChatMessage[], { userId }: { userId?: string } = {}) {
  const client = await connectMcp(userId);
  try {
    const { tools } = await client.listTools();
    const functionDeclarations = toGeminiTools(tools);

    const contents: Content[] = messages.map((m) => ({
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
        },
      });

      const calls = response.functionCalls ?? [];

      if (calls.length === 0) {
        return { reply: response.text ?? "Sorry, I didn't catch that." };
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
              response: { result: text, isError: Boolean(result.isError) },
            },
          };
        }),
      );

      contents.push({ role: "user", parts: resultParts });
    }

    return { reply: "Sorry, that took too many steps. Could you ask more simply?" };
  } finally {
    await client.close();
  }
}
