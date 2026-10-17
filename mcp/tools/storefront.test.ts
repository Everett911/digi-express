import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { searchProducts } from "../../lib/utils/productSearch";
import { createStorefrontServer } from "../storefront-server";

const { findProducts, findOrders } = vi.hoisted(() => ({
  findProducts: vi.fn(),
  findOrders: vi.fn(),
}));

vi.mock("../../lib/prisma", () => ({
  prisma: { product: { findMany: findProducts }, order: { findMany: findOrders } },
}));
vi.mock("../../lib/utils/productSearch", () => ({ searchProducts: vi.fn() }));
vi.mock("./delivery-options", () => ({ listDeliveryOptions: vi.fn(async () => []) }));

async function connect(userId?: string) {
  const server = createStorefrontServer({ userId });
  const client = new Client({ name: "test", version: "1.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return client;
}

async function call(client: Client, name: string, args: Record<string, unknown> = {}) {
  const result = await client.callTool({ name, arguments: args });
  const [block] = result.content as { text: string }[];
  return { isError: Boolean(result.isError), text: block.text };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("storefront server", () => {
  it("only offers the public tools when nobody is signed in", async () => {
    const { tools } = await (await connect()).listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([
      "get-product",
      "list-delivery-options",
      "search-products",
    ]);
  });

  it("adds my-orders for a signed-in customer", async () => {
    const { tools } = await (await connect("user-1")).listTools();
    expect(tools.map((t) => t.name)).toContain("my-orders");
  });
});

describe("search-products", () => {
  it("keeps the search ranking, not the database order", async () => {
    vi.mocked(searchProducts).mockResolvedValue({ ids: ["a", "b", "c"], correctedQuery: null });
    findProducts.mockResolvedValue([{ id: "c" }, { id: "a" }, { id: "b" }]);

    const { text } = await call(await connect(), "search-products", { query: "shoes" });
    expect(JSON.parse(text).map((p: { id: string }) => p.id)).toEqual(["a", "b", "c"]);
  });

  it("applies the price limit to every match before taking the top 8", async () => {
    const ids = Array.from({ length: 30 }, (_, i) => `p${i}`);
    vi.mocked(searchProducts).mockResolvedValue({ ids, correctedQuery: null });
    findProducts.mockResolvedValue([]);

    await call(await connect(), "search-products", { query: "shoes", maxPriceCents: 5000 });
    expect(findProducts.mock.calls[0][0]?.where).toEqual({
      id: { in: ids },
      priceCents: { lte: 5000 },
    });
  });
});

describe("my-orders", () => {
  it("only reads the signed-in customer's orders", async () => {
    findOrders.mockResolvedValue([]);

    await call(await connect("user-1"), "my-orders");
    expect(findOrders.mock.calls[0][0]?.where).toEqual({ userId: "user-1", id: undefined });
  });

  it("adds each item's estimated arrival date", async () => {
    findOrders.mockResolvedValue([
      {
        id: "o1",
        status: "PAID",
        totalCostCents: 2500,
        createdAt: new Date("2026-10-01T10:00:00"),
        items: [{ name: "Tee", quantity: 1, priceCents: 2500, deliveryDays: 7 }],
      },
    ]);

    const { text } = await call(await connect("user-1"), "my-orders");
    const [item] = JSON.parse(text)[0].items;
    expect(item.estimatedArrival).toBe("2026-10-08");
    expect(item).not.toHaveProperty("deliveryDays");
  });

  it("says when the named order isn't theirs or doesn't exist", async () => {
    findOrders.mockResolvedValue([]);

    const result = await call(await connect("user-1"), "my-orders", {
      orderId: "5f0c6b1e-2c3d-4e5f-8a9b-0c1d2e3f4a5b",
    });
    expect(result).toEqual({ isError: true, text: "Order not found" });
  });
});
