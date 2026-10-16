import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { calculateCartTotals } from "../../lib/checkout";
import { prisma } from "../../lib/prisma";
import { ok } from "../lib/result";

export function registerCartTools(server: McpServer) {
  server.registerTool(
    "get-user-cart",
    {
      title: "Get User Cart",
      description: "Get a user's cart items and totals (product, shipping, 10% tax)",
      inputSchema: { userId: z.string() },
      annotations: { readOnlyHint: true },
    },
    async ({ userId }) => {
      const items = await prisma.cartItem.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        include: {
          product: {
            select: { id: true, name: true, priceCents: true, isAvailableForPurchase: true },
          },
          deliveryOption: { select: { id: true, deliveryDays: true, priceCents: true } },
        },
      });
      return ok({ items, totals: calculateCartTotals(items) });
    },
  );
}
