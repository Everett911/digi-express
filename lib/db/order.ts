import { prisma } from "../prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cache as reactCache } from "react";

export const getOrderFromSession = reactCache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return;

  return await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });
});
