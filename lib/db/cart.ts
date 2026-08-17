import { prisma } from "../prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cache as reactCache } from "react";

export const getCartFromSession = reactCache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return;

  return await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: true,
      deliveryOption: true,
    },
  });
});
