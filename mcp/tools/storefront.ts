import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import dayjs from "dayjs";
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

//
export function registerStorefrontTools(server: McpServer, { userId }: { userId?: string } = {}) {
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

  if (!userId) return;

  server.registerTool(
    "my-orders",
    {
      description:
        "The signed-in customer's 10 most recent orders, newest first, with status, items and each item's estimated arrival date. Prices are in cents.",
      inputSchema: {
        orderId: z.uuid().optional().describe("Only this order, if the customer names one"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ orderId }) => {
      const orders = await prisma.order.findMany({
        where: { userId, id: orderId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          status: true,
          totalCostCents: true,
          createdAt: true,
          items: {
            select: {
              name: true,
              quantity: true,
              priceCents: true,
              color: true,
              size: true,
              deliveryDays: true,
            },
          },
        },
      });
      if (orderId && orders.length === 0) return fail("Order not found");

      return ok(
        orders.map(({ items, ...order }) => ({
          ...order,
          items: items.map(({ deliveryDays, ...item }) => ({
            ...item,
            estimatedArrival: dayjs(order.createdAt).add(deliveryDays, "day").format("YYYY-MM-DD"),
          })),
        })),
      );
    },
  );
}
