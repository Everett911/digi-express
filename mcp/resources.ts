import { readFile } from "node:fs/promises";
import path from "node:path";
import { type McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { prisma } from "../lib/prisma";
import { jsonResource } from "./lib/result";
import { listDeliveryOptions } from "./tools/delivery-options";
import { getOrder } from "./tools/orders";
import { getStoreStats } from "./tools/stats";

// The server is started from the project root (see .mcp.json and mcp:dev).
const SCHEMA_PATH = path.resolve(process.cwd(), "prisma/schema.prisma");

export function registerResources(server: McpServer) {
  server.registerResource(
    "products",
    "products://all",
    {
      title: "Products",
      description: "Every product: id, name, brand, price, availability",
      mimeType: "application/json",
    },
    async (uri) =>
      jsonResource(
        uri,
        await prisma.product.findMany({
          select: {
            id: true,
            name: true,
            brand: true,
            priceCents: true,
            isAvailableForPurchase: true,
          },
          orderBy: { createdAt: "desc" },
        }),
      ),
  );

  server.registerResource(
    "product",
    new ResourceTemplate("product://{id}", {
      list: async () => {
        const products = await prisma.product.findMany({
          select: { id: true, name: true, brand: true },
          orderBy: { name: "asc" },
        });
        return {
          resources: products.map((p) => ({
            uri: `product://${p.id}`,
            name: p.name,
            description: p.brand,
            mimeType: "application/json",
          })),
        };
      },
    }),
    { title: "Product", description: "Every field of one product", mimeType: "application/json" },
    async (uri, { id }) => {
      const product = await prisma.product.findUnique({ where: { id: String(id) } });
      if (!product) throw new Error(`Product ${String(id)} not found.`);
      return jsonResource(uri, product);
    },
  );

  server.registerResource(
    "order",
    new ResourceTemplate("order://{id}", { list: undefined }),
    {
      title: "Order",
      description: "One order with its items and customer",
      mimeType: "application/json",
    },
    async (uri, { id }) => {
      const order = await getOrder(String(id));
      if (!order) throw new Error(`Order ${String(id)} not found.`);
      return jsonResource(uri, order);
    },
  );

  server.registerResource(
    "delivery-options",
    "delivery-options://all",
    {
      title: "Delivery Options",
      description: "Shipping speeds and prices",
      mimeType: "application/json",
    },
    async (uri) => jsonResource(uri, await listDeliveryOptions()),
  );

  server.registerResource(
    "stats",
    "stats://overview",
    {
      title: "Store Stats",
      description: "Counts, revenue and best sellers",
      mimeType: "application/json",
    },
    async (uri) => jsonResource(uri, await getStoreStats()),
  );

  server.registerResource(
    "prisma-schema",
    "schema://prisma",
    {
      title: "Database Schema",
      description: "The Prisma schema: models, fields and relations",
      mimeType: "text/plain",
    },
    async (uri) => ({
      contents: [
        { uri: uri.href, mimeType: "text/plain", text: await readFile(SCHEMA_PATH, "utf8") },
      ],
    }),
  );
}
