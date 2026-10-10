"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { assertAdmin } from "../_lib/auth";

export async function deleteUser(id: string) {
  const session = await assertAdmin();
  if (session.user.id === id) {
    return { error: "You can't delete your own account." };
  }

  // Orders reference users with onDelete: Restrict, so only customers
  // without orders can be removed.
  const orderCount = await prisma.order.count({ where: { userId: id } });
  if (orderCount > 0) {
    return { error: "Customers with orders can't be deleted." };
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin", "layout");
}
