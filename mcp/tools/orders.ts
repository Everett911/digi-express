import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OrderStatus, type Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { fail, guard, ok } from "../lib/result";
import { revalidateOrders } from "../lib/revalidate";

const userSummary = { select: { id: true, name: true, email: true } } as const;

export function getOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true, user: userSummary },
  });
}

export function registerOrderTools(server: McpServer, { readOnly }: { readOnly: boolean }) {
  server.registerTool(
    "list-orders",
    {
      title: "List Orders",
      description: "List orders, newest first, with the customer and item count",
      inputSchema: {
        status: z.enum(OrderStatus).optional(),
        userId: z.string().optional(),
        from: z.iso
          .datetime({ offset: true })
          .or(z.iso.date())
          .optional()
          .describe("Created on or after"),
        to: z.iso.datetime({ offset: true }).or(z.iso.date()).optional().describe("Created before"),
        take: z.number().int().min(1).max(100).default(25),
        skip: z.number().int().min(0).default(0),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ status, userId, from, to, take, skip }) => {
      const where: Prisma.OrderWhereInput = {
        status,
        userId,
        createdAt: {
          gte: from ? new Date(from) : undefined,
          lt: to ? new Date(to) : undefined,
        },
      };
      const [total, orders] = await Promise.all([
        prisma.order.count({ where }),
        prisma.order.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take,
          skip,
          include: { user: userSummary, _count: { select: { items: true } } },
        }),
      ]);
      return ok({ total, skip, take, orders });
    },
  );

  const getOrderConfig = {
    description: "Get an order by ID with its items and customer",
    inputSchema: { orderId: z.uuid().describe("Order ID") },
    annotations: { readOnlyHint: true },
  };
  const getOrderHandler = async ({ orderId }: { orderId: string }) => {
    const order = await getOrder(orderId);
    return order ? ok(order) : fail(`Order ${orderId} not found.`);
  };
  server.registerTool("get-order", { title: "Get Order", ...getOrderConfig }, getOrderHandler);
  // Older name, kept so existing prompts keep working.
  server.registerTool(
    "order-summary",
    { title: "Order Summary", ...getOrderConfig },
    getOrderHandler,
  );

  if (readOnly) return;

  server.registerTool(
    "update-order-status",
    {
      title: "Update Order Status",
      description: "Change an order's status (PAID, SHIPPED, DELIVERED, CANCELLED)",
      inputSchema: { id: z.uuid(), status: z.enum(OrderStatus) },
      annotations: { idempotentHint: true },
    },
    async ({ id, status }) =>
      guard(`Order ${id} not found.`, async () => {
        const order = await prisma.order.update({ where: { id }, data: { status } });
        await revalidateOrders();
        return ok(order);
      }),
  );

  server.registerTool(
    "delete-order",
    {
      title: "Delete Order",
      description:
        "Permanently delete an order and its items. This does not refund the Stripe payment; prefer status CANCELLED.",
      inputSchema: {
        id: z.uuid(),
        confirm: z.literal(true).describe("Must be true to confirm the deletion"),
      },
      annotations: { destructiveHint: true },
    },
    async ({ id }) =>
      guard(`Order ${id} not found.`, async () => {
        await prisma.order.delete({ where: { id } });
        await revalidateOrders();
        return ok(`Deleted order ${id}.`);
      }),
  );
}
