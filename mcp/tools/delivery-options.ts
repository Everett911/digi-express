import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { fail, guard, ok } from "../lib/result";
import { revalidateSite } from "../lib/revalidate";

export function listDeliveryOptions() {
  return prisma.deliveryOption.findMany({
    select: { id: true, deliveryDays: true, priceCents: true },
    orderBy: { deliveryDays: "desc" },
  });
}

const revalidateDelivery = () => revalidateSite([], ["/checkout"]);

export function registerDeliveryOptionTools(
  server: McpServer,
  { readOnly }: { readOnly: boolean },
) {
  server.registerTool(
    "list-delivery-options",
    {
      title: "List Delivery Options",
      description:
        "List delivery options. deliveryDays = how many days shipping takes, priceCents = shipping cost in cents (0 = free)",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async () => ok(await listDeliveryOptions()),
  );

  if (readOnly) return;

  server.registerTool(
    "create-delivery-option",
    {
      title: "Create Delivery Option",
      inputSchema: {
        id: z.string().trim().min(1).describe('Readable ID, e.g. "3"'),
        deliveryDays: z.number().int().min(0),
        priceCents: z.number().int().min(0).describe("0 = free shipping"),
      },
    },
    async (data) =>
      guard(`Could not create delivery option ${data.id}.`, async () => {
        const option = await prisma.deliveryOption.create({ data });
        await revalidateDelivery();
        return ok(option);
      }),
  );

  server.registerTool(
    "update-delivery-option",
    {
      title: "Update Delivery Option",
      inputSchema: {
        id: z.string(),
        deliveryDays: z.number().int().min(0).optional(),
        priceCents: z.number().int().min(0).optional(),
      },
      annotations: { idempotentHint: true },
    },
    async ({ id, ...data }) =>
      guard(`Delivery option ${id} not found.`, async () => {
        const option = await prisma.deliveryOption.update({ where: { id }, data });
        await revalidateDelivery();
        return ok(option);
      }),
  );

  server.registerTool(
    "delete-delivery-option",
    {
      title: "Delete Delivery Option",
      description: "Delete a delivery option. Refused while any cart item uses it.",
      inputSchema: {
        id: z.string(),
        confirm: z.literal(true).describe("Must be true to confirm the deletion"),
      },
      annotations: { destructiveHint: true },
    },
    async ({ id }) => {
      // Cart items reference delivery options with onDelete: Restrict.
      const inUse = await prisma.cartItem.count({ where: { deliveryOptionId: id } });
      if (inUse > 0) return fail(`Delivery option ${id} is used by ${inUse} cart item(s).`);

      return guard(`Delivery option ${id} not found.`, async () => {
        await prisma.deliveryOption.delete({ where: { id } });
        await revalidateDelivery();
        return ok(`Deleted delivery option ${id}.`);
      });
    },
  );
}
