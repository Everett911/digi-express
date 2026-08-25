import { Prisma } from "@/prisma/generated/client";

export function mapPriceGroupsToPrisma(
  priceGroups: string[],
): Prisma.ProductWhereInput[] {
  if (!priceGroups || priceGroups.length === 0) return [];

  return priceGroups.map((group) => {
    const normalizedGroup = group.trim();

    if (normalizedGroup.toLowerCase().startsWith("under")) {
      const maxAmount = parseInt(normalizedGroup.replace(/[^0-9]/g, ""), 10);
      return {
        priceCents: { lte: maxAmount * 100 },
      };
    }

    if (normalizedGroup.toLowerCase().startsWith("over")) {
      const minAmount = parseInt(normalizedGroup.replace(/[^0-9]/g, ""), 10);
      return {
        priceCents: { gte: minAmount * 100 },
      };
    }

    if (normalizedGroup.includes("-")) {
      const [minStr, maxStr] = normalizedGroup.split("-");
      const minAmount = parseInt(minStr.replace(/[^0-9]/g, ""), 10);
      const maxAmount = parseInt(maxStr.replace(/[^0-9]/g, ""), 10);

      return {
        priceCents: {
          gte: minAmount * 100,
          lte: maxAmount * 100,
        },
      };
    }

    return {};
  });
}
