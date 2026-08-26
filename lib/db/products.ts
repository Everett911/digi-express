import { prisma } from "../prisma";
import { cache } from "@/lib/cache";
import type { Product } from "@prisma/client";
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
    tags: ["products-newest"], //
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

  const types = (
    typeof searchParams.type === "string"
      ? [searchParams.type]
      : searchParams.type || []
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

  return await prisma.product.findMany({
    where: {
      AND: [
        searchQuery ? buildProductSearchWhere(searchQuery) : {},
        sizes.length > 0 ? { size: { hasSome: sizes } } : {},
        colors.length > 0 ? { color: { hasSome: colors } } : {},
        types.length > 0
          ? {
              OR: types.map((t) => ({
                keywords: { has: t },
              })),
            }
          : {},
        brands.length > 0 ? { brand: { in: brands } } : {},
        priceFilters.length > 0 ? { OR: priceFilters } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProducts(
  searchQuery: string,
  searchParamsPromise: Promise<AllowedSearchParams>,
) {
  const resolvedParams = await searchParamsPromise;

  return cache(
    async (): Promise<Product[]> => {
      return fetchProductsFromDb(searchQuery, resolvedParams);
    },

    ["products", "search", searchQuery, JSON.stringify(resolvedParams)],
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
