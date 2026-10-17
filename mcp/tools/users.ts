import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { fail, guard, ok } from "../lib/result";
import { revalidateAdmin } from "../lib/revalidate";

// Never select sessions or accounts: they hold auth tokens and password hashes.
const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  emailVerified: true,
  image: true,
  createdAt: true,
  _count: { select: { orders: true, cartItems: true } },
} satisfies Prisma.UserSelect;

export function registerUserTools(server: McpServer, { readOnly }: { readOnly: boolean }) {
  server.registerTool(
    "list-users",
    {
      title: "List Users",
      description: "List customers and admins, newest first",
      inputSchema: {
        search: z.string().optional().describe("Matches name or email"),
        role: z.enum(["customer", "admin"]).optional(),
        take: z.number().int().min(1).max(100).default(25),
        skip: z.number().int().min(0).default(0),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ search, role, take, skip }) => {
      const where: Prisma.UserWhereInput = {
        role,
        OR: search
          ? [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ]
          : undefined,
      };
      const [total, users] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take,
          skip,
          select: safeUserSelect,
        }),
      ]);
      return ok({ total, skip, take, users });
    },
  );

  server.registerTool(
    "get-user",
    {
      title: "Get User",
      description: "Get a user by ID or email, with their 10 latest orders",
      inputSchema: {
        id: z.string().optional(),
        email: z.email().optional(),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ id, email }) => {
      if (!id && !email) return fail("Pass id or email.");
      const user = await prisma.user.findUnique({
        where: id ? { id } : { email: email! },
        select: {
          ...safeUserSelect,
          orders: {
            orderBy: { createdAt: "desc" },
            take: 10,
            select: { id: true, status: true, totalCostCents: true, createdAt: true },
          },
        },
      });
      return user ? ok(user) : fail(`User ${id ?? email} not found.`);
    },
  );

  if (readOnly) return;

  server.registerTool(
    "update-user-role",
    {
      title: "Update User Role",
      description: "Make a user an admin or a customer",
      inputSchema: { id: z.string(), role: z.enum(["customer", "admin"]) },
      annotations: { idempotentHint: true },
    },
    async ({ id, role }) =>
      guard(`User ${id} not found.`, async () => {
        const user = await prisma.user.update({
          where: { id },
          data: { role },
          select: safeUserSelect,
        });
        await revalidateAdmin();
        return ok(user);
      }),
  );

  server.registerTool(
    "delete-user",
    {
      title: "Delete User",
      description:
        "Permanently delete a user with their sessions, accounts and cart. Refused for users with orders.",
      inputSchema: {
        id: z.string(),
        confirm: z.literal(true).describe("Must be true to confirm the deletion"),
      },
      annotations: { destructiveHint: true },
    },
    async ({ id }) => {
      // Orders reference users with onDelete: Restrict.
      const orderCount = await prisma.order.count({ where: { userId: id } });
      if (orderCount > 0)
        return fail(`User ${id} has ${orderCount} order(s) and can't be deleted.`);

      return guard(`User ${id} not found.`, async () => {
        const user = await prisma.user.delete({ where: { id }, select: { email: true } });
        await revalidateAdmin();
        return ok(`Deleted user ${user.email} (${id}).`);
      });
    },
  );
}
