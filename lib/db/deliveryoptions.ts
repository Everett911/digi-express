import { DeliveryOption } from "@/src/schemas/deliveryOptions";
import { prisma } from "../prisma";
import { cache } from "@/lib/cache";

export const getDeliveryOptions = cache(
  async (): Promise<DeliveryOption[]> => {
    return prisma.deliveryOption.findMany({
      orderBy: { id: "desc" },
    });
  },
  ["getDeliveryOptions"],
  {
    revalidate: 60 * 60 * 24 * 7,
    tags: ["delivery-options"],
  },
);
