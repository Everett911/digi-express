import { Prisma } from "@prisma/client";

// Price filter buckets shown in the filter panel. Ranges are [min, max) so a
// price on a boundary (e.g. exactly $25) lands in exactly one bucket.
export const PRICE_GROUPS = [
  "Under $10",
  "$10 - $25",
  "$25 - $50",
  "$50 - $100",
  "Over $100",
] as const;

function dollarsToCents(value: string) {
  return parseInt(value.replace(/[^0-9]/g, ""), 10) * 100;
}

// Accepts any "Under $X", "Over $X" or "$X - $Y" label, so older links such
// as the header's "Under $75" keep working.
export function priceGroupToRange(
  group: string,
): Prisma.IntFilter<"Product"> | null {
  const normalized = group.trim().toLowerCase();

  if (normalized.startsWith("under")) {
    const max = dollarsToCents(normalized);
    return Number.isNaN(max) ? null : { lt: max };
  }

  if (normalized.startsWith("over")) {
    const min = dollarsToCents(normalized);
    return Number.isNaN(min) ? null : { gte: min };
  }

  if (normalized.includes("-")) {
    const [minStr, maxStr] = normalized.split("-");
    const min = dollarsToCents(minStr);
    const max = dollarsToCents(maxStr);
    if (Number.isNaN(min) || Number.isNaN(max)) return null;
    return { gte: min, lt: max };
  }

  return null;
}

export function mapPriceGroupsToPrisma(
  priceGroups: string[],
): Prisma.ProductWhereInput[] {
  return priceGroups.flatMap((group) => {
    const range = priceGroupToRange(group);
    return range ? [{ priceCents: range }] : [];
  });
}
