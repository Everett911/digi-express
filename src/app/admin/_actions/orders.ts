"use server";

import { z } from "zod";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { assertAdmin } from "../_lib/auth";

export async function deleteOrder(id: string) {
  await assertAdmin();

  await prisma.order.delete({ where: { id } });
  revalidatePath("/admin", "layout");
}

const statusSchema = z.enum(OrderStatus);

export async function updateOrderStatus(id: string, status: string) {
  await assertAdmin();

  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) return { error: "Unknown order status." };

  await prisma.order.update({ where: { id }, data: { status: parsed.data } });
  revalidatePath("/admin", "layout");
  revalidatePath("/order");
}
