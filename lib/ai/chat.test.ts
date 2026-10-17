import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { runChat } from "./chat";

// Fake Gemini and database: these tests never spend real tokens.
const { generateContent, findProducts } = vi.hoisted(() => ({
  generateContent: vi.fn(),
  findProducts: vi.fn(),
}));

vi.mock("@google/genai", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@google/genai")>()),
  GoogleGenAI: class {
    models = { generateContent };
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: { product: { findMany: findProducts } } }));
vi.mock("@/lib/utils/productSearch", () => ({
  searchProducts: vi.fn(async () => ({ ids: ["p1", "p2"], correctedQuery: null })),
}));

const reply = (text: string) => ({ text, functionCalls: undefined });
const toolCall = (name: string, args: object) => ({
  functionCalls: [{ id: "c1", name, args }],
  candidates: [{ content: { role: "model", parts: [{ functionCall: { name, args } }] } }],
});

const products = [
  { id: "p1", name: "Red Sneaker", brand: "Acme", priceCents: 3500, image: ["/a.png", "/b.png"] },
  { id: "p2", name: "Blue Sneaker", brand: "Acme", priceCents: 3900, image: [] },
];

beforeEach(() => {
  vi.clearAllMocks();
  findProducts.mockResolvedValue(products);
});

describe("runChat", () => {
  it("answers directly when no tool is needed", async () => {
    generateContent.mockResolvedValueOnce(reply("Hi there!"));

    const result = await runChat([{ role: "user", text: "hello" }]);
    expect(result).toEqual({ reply: "Hi there!", products: [] });
  });

  it("sends the model compact tool results without image URLs", async () => {
    generateContent
      .mockResolvedValueOnce(toolCall("search-products", { query: "sneakers" }))
      .mockResolvedValueOnce(reply("Try the Red Sneaker."));

    await runChat([{ role: "user", text: "sneakers" }]);

    const contents = generateContent.mock.calls[1][0].contents;
    const result = contents.at(-1).parts[0].functionResponse.response.result;
    expect(result).not.toContain("image");
    expect(result).not.toContain("\n");
    expect(JSON.parse(result)[0]).toEqual({
      id: "p1",
      name: "Red Sneaker",
      brand: "Acme",
      priceCents: 3500,
    });
  });

  it("shows cards only for the products the reply names, in that order", async () => {
    generateContent
      .mockResolvedValueOnce(toolCall("search-products", { query: "sneakers" }))
      .mockResolvedValueOnce(reply("The blue sneaker is popular, or the Red Sneaker."));

    const { products: cards } = await runChat([{ role: "user", text: "sneakers" }]);
    expect(cards).toEqual([
      { id: "p2", name: "Blue Sneaker", priceCents: 3900, image: null },
      { id: "p1", name: "Red Sneaker", priceCents: 3500, image: "/a.png" },
    ]);
  });

  it("stops after too many tool rounds", async () => {
    generateContent.mockResolvedValue(toolCall("search-products", { query: "x" }));

    const result = await runChat([{ role: "user", text: "loop" }]);
    expect(generateContent).toHaveBeenCalledTimes(5);
    expect(result.reply).toContain("too many steps");
  });

  it("sends only the latest messages, starting with the customer", async () => {
    generateContent.mockResolvedValueOnce(reply("ok"));
    const history = Array.from({ length: 15 }, (_, i) => ({
      role: i % 2 === 0 ? ("user" as const) : ("model" as const),
      text: `m${i}`,
    }));

    await runChat(history);
    const contents = generateContent.mock.calls[0][0].contents;
    expect(contents[0]).toEqual({ role: "user", parts: [{ text: "m6" }] });
    expect(contents).toHaveLength(9);
  });

  it("tells the model whether the customer is signed in", async () => {
    generateContent.mockResolvedValue(reply("ok"));

    await runChat([{ role: "user", text: "orders?" }]);
    await runChat([{ role: "user", text: "orders?" }], { userId: "u1" });
    const [signedOut, signedIn] = generateContent.mock.calls.map(
      ([request]) => request.config.systemInstruction,
    );
    expect(signedOut).toContain("not signed in");
    expect(signedIn).toContain("is signed in");
  });
});
