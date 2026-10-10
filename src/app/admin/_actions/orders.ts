"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { assertAdmin } from "../_lib/auth";

export async function deleteOrder(id: string) {
  await assertAdmin();

  await prisma.order.delete({ where: { id } });
  revalidatePath("/admin", "layout");
}
