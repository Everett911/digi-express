import { prisma } from "../prisma";
import { cache } from "@/lib/cache";
import type { Prisma, Product } from "@prisma/client";
import { mapPriceGroupsToPrisma } from "@/lib/utils/priceMapper";
import { buildProductSearchWhere } from "../utils/productSearch";

export const getNewestProducts = cache(
  async (): Promise<Product[]> => {
    return prisma.product.findMany({
      where: { isAvailableForPurchase: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
  },
  ["/", "getNewestProducts"],
  {
    revalidate: 60 * 60 * 24,
    tags: ["products-newest"],
  },
);

type AllowedSearchParams = {
  search?: string;
  size?: string | string[];
  color?: string | string[];
  priceGroup?: string | string[];
  type?: string | string[];
  brand?: string | string[];
};

async function fetchProductsFromDb(
  searchQuery: string,
  searchParams: AllowedSearchParams,
): Promise<Product[]> {
  const sizes = (
    typeof searchParams.size === "string"
      ? [searchParams.size]
      : searchParams.size || []
  ).map((val) => val.toLowerCase());

  const colors = (
    typeof searchParams.color === "string"
      ? [searchParams.color]
      : searchParams.color || []
  ).map((val) => val.toLowerCase());

  const brands = (
    typeof searchParams.brand === "string"
      ? [searchParams.brand]
      : searchParams.brand || []
  ).map((val) => val.toLowerCase());

  const priceGroups =
    typeof searchParams.priceGroup === "string"
      ? [searchParams.priceGroup]
      : searchParams.priceGroup || [];
  const priceFilters = mapPriceGroupsToPrisma(priceGroups);

  const rawTypes = (
    typeof searchParams.type === "string"
      ? [searchParams.type]
      : searchParams.type || []
  ).map((val) => val.trim().toLowerCase());

  const isFilteringForMen = rawTypes.includes("men");
  const isFilteringForWomen = rawTypes.includes("women");

  const structuralKeywords = rawTypes.filter(
    (t) => t !== "men" && t !== "women",
  );

  const conditions: Prisma.ProductWhereInput[] = [];

  if (searchQuery) conditions.push(buildProductSearchWhere(searchQuery));
  if (sizes.length > 0) conditions.push({ size: { hasSome: sizes } });
  if (colors.length > 0) conditions.push({ color: { hasSome: colors } });
  if (brands.length > 0) conditions.push({ brand: { in: brands } });
  if (priceFilters.length > 0) conditions.push({ OR: priceFilters });
  if (isFilteringForMen && !isFilteringForWomen) {
    conditions.push({
      keywords: {
        hasSome: ["men", "Men", "MEN"],
      },
    });
    conditions.push({
      NOT: {
        keywords: {
          hasSome: ["women", "Women", "WOMEN"],
        },
      },
    });
  } else if (isFilteringForWomen && !isFilteringForMen) {
    conditions.push({
      keywords: {
        hasSome: ["women", "Women", "WOMEN"],
      },
    });
    conditions.push({
      NOT: {
        keywords: {
          hasSome: ["men", "Men", "MEN"],
        },
      },
    });
  }

  // 3. Match general structural parameters (e.g. clothing, accessories)
  if (structuralKeywords.length > 0) {
    conditions.push({
      OR: structuralKeywords.flatMap((t) => [
        { keywords: { has: t } },
        { keywords: { has: t.toUpperCase() } },
        { keywords: { has: t.charAt(0).toUpperCase() + t.slice(1) } },
      ]),
    });
  }

  return await prisma.product.findMany({
    where: conditions.length > 0 ? { AND: conditions } : {},
    orderBy: { createdAt: "desc" },
  });
}

export async function getProducts(
  searchQuery: string,
  searchParamsPromise: Promise<AllowedSearchParams>,
) {
  const resolvedParams = await searchParamsPromise;

  const serializedKey = JSON.stringify(
    resolvedParams,
    Object.keys(resolvedParams).sort(),
  );

  return cache(
    async (): Promise<Product[]> => {
      return fetchProductsFromDb(searchQuery, resolvedParams);
    },
    ["products", "search", searchQuery, serializedKey],
    {
      revalidate: 60 * 60 * 24,
      tags: ["products"],
    },
  )();
}

export async function getProductCount() {
  const [onactiveCount, offactiveCount] = await Promise.all([
    prisma.product.count({ where: { isAvailableForPurchase: true } }),
    prisma.product.count({ where: { isAvailableForPurchase: false } }),
  ]);
  return { onactiveCount, offactiveCount };
}
