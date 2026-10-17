import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { searchProducts } from "../../lib/utils/productSearch";
import { fail, ok } from "../lib/result";
import { listDeliveryOptions } from "./delivery-options";

const publicProductSelect = {
  id: true,
  name: true,
  brand: true,
  priceCents: true,
  image: true,
} as const;

export function registerStorefrontTools(server: McpServer) {
  server.registerTool(
    "search-products",
    {
      description:
        "Search the store's products by what the customer wants (id, name, brand, price and image). Prices are in cents.",
      inputSchema: {
        query: z.string().min(1).describe("What the customer is looking for, e.g. 'red shoes'"),
        maxPriceCents: z
          .number()
          .int()
          .optional()
          .describe("Upper price limit in cents, e.g. 10000 for $100.00"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ query, maxPriceCents }) => {
      const { ids } = await searchProducts(query);

      const products = await prisma.product.findMany({
        where: { id: { in: ids }, priceCents: { lte: maxPriceCents } },
        select: publicProductSelect,
      });

      const rank = new Map(ids.map((id, index) => [id, index]));
      products.sort((a, b) => rank.get(a.id)! - rank.get(b.id)!);
      return ok(products.slice(0, 8));
    },
  );

  server.registerTool(
    "get-product",
    {
      description:
        "Get details (description, price, size and color) of a product by its id. Price is in cents.",
      inputSchema: { id: z.uuid() },
      annotations: { readOnlyHint: true },
    },
    async ({ id }) => {
      const product = await prisma.product.findFirst({
        where: { id, isAvailableForPurchase: true },
        select: {
          ...publicProductSelect,
          description: true,
          color: true,
          size: true,
        },
      });
      return product ? ok(product) : fail("Product not found or not available for purchase");
    },
  );

  server.registerTool(
    "list-delivery-options",
    {
      description: "Shipping options: deliveryDays and priceCents (0 = free shipping)",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async () => ok(await listDeliveryOptions()),
  );
}
