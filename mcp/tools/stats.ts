import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { prisma } from "../../lib/prisma";
import { ok } from "../lib/result";

export async function getStoreStats() {
  const [products, availableProducts, users, ordersByStatus, topSellers] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isAvailableForPurchase: true } }),
    prisma.user.count(),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
      _sum: { totalCostCents: true },
    }),
    prisma.orderItem.groupBy({
      by: ["productId", "name"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  // Cancelled orders don't count towards revenue.
  const revenueCents = ordersByStatus
    .filter((row) => row.status !== "CANCELLED")
    .reduce((sum, row) => sum + (row._sum.totalCostCents ?? 0), 0);

  return {
    products: { total: products, available: availableProducts },
    users,
    orders: ordersByStatus.map((row) => ({
      status: row.status,
      count: row._count._all,
      totalCostCents: row._sum.totalCostCents ?? 0,
    })),
    revenueCents,
    topSellers: topSellers.map((row) => ({
      productId: row.productId,
      name: row.name,
      quantitySold: row._sum.quantity ?? 0,
    })),
  };
}

export function registerStatsTools(server: McpServer) {
  server.registerTool(
    "store-stats",
    {
      title: "Store Stats",
      description:
        "Product, user and order counts, revenue (excluding cancelled orders) and the 5 best-selling products",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async () => ok(await getStoreStats()),
  );
}
