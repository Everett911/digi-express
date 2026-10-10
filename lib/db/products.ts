import { prisma } from "../prisma";
import { cache } from "@/lib/cache";
import type { Prisma, Product } from "@prisma/client";
import { mapPriceGroupsToPrisma } from "@/lib/utils/priceMapper";
import { searchProducts } from "../utils/productSearch";

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

export type ProductListResult = {
  products: Product[];
  // Set when the search corrected a misspelling, e.g. "snekers" -> "sneaker".
  correctedQuery: string | null;
};

const DEPARTMENTS = [
  { aliases: ["men", "men's", "mens"], exclusive: false },
  { aliases: ["women", "women's", "womens"], exclusive: false },
  { aliases: ["kid", "kid's", "kids"], exclusive: true },
  { aliases: ["homeware", "homewares"], exclusive: true },
];

// Keywords are stored with inconsistent casing ("men", "Men", "MEN").
function keywordVariants(words: string[]) {
  return words.flatMap((word) => [
    word,
    word.charAt(0).toUpperCase() + word.slice(1),
    word.toUpperCase(),
  ]);
}

async function fetchProductsFromDb(
  searchQuery: string,
  searchParams: AllowedSearchParams,
): Promise<ProductListResult> {
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
      ? searchParams.type.split(",")
      : searchParams.type || []
  )
    .flatMap((val) => val.split(","))
    .map((val) => val.trim().toLowerCase())
    .filter(Boolean);

  // A product belongs to a department through its keywords. Men and women
  // overlap so unisex products appear in both; kids and home items only
  // appear under their own department.
  const selectedDepartments = DEPARTMENTS.filter((department) =>
    department.aliases.some((alias) => rawTypes.includes(alias)),
  );
  const allAliases = DEPARTMENTS.flatMap((department) => department.aliases);
  const structuralKeywords = rawTypes.filter((t) => !allAliases.includes(t));

  const conditions: Prisma.ProductWhereInput[] = [
    { isAvailableForPurchase: true },
  ];

  // Ranked IDs from the text search; null means "no search, don't rank".
  const search = searchQuery ? await searchProducts(searchQuery) : null;
  const correctedQuery = search?.correctedQuery ?? null;
  if (search) {
    if (search.ids.length === 0) return { products: [], correctedQuery };
    conditions.push({ id: { in: search.ids } });
  }
  if (sizes.length > 0) conditions.push({ size: { hasSome: sizes } });
  if (colors.length > 0) conditions.push({ color: { hasSome: colors } });
  if (brands.length > 0) conditions.push({ brand: { in: brands } });
  if (priceFilters.length > 0) conditions.push({ OR: priceFilters });

  if (selectedDepartments.length > 0) {
    conditions.push({
      keywords: {
        hasSome: selectedDepartments.flatMap((department) =>
          keywordVariants(department.aliases),
        ),
      },
    });
    const excluded = DEPARTMENTS.filter(
      (department) =>
        department.exclusive && !selectedDepartments.includes(department),
    );
    if (excluded.length > 0) {
      conditions.push({
        NOT: {
          keywords: {
            hasSome: excluded.flatMap((department) =>
              keywordVariants(department.aliases),
            ),
          },
        },
      });
    }
  }

  if (structuralKeywords.length > 0) {
    conditions.push({
      keywords: { hasSome: keywordVariants(structuralKeywords) },
    });
  }

  const products = await prisma.product.findMany({
    where: { AND: conditions },
    orderBy: { createdAt: "desc" },
  });

  if (!search) return { products, correctedQuery };

  const rank = new Map(search.ids.map((id, index) => [id, index]));
  products.sort((a, b) => rank.get(a.id)! - rank.get(b.id)!);
  return { products, correctedQuery };
}

export async function getProducts(
  searchQuery: string,
  searchParamsPromise: Promise<AllowedSearchParams>,
): Promise<ProductListResult> {
  const resolvedParams = await searchParamsPromise;
  // "Shoes" and " shoes " give the same results, so share one cache entry.
  const normalizedQuery = searchQuery.trim().replace(/\s+/g, " ").toLowerCase();

  const serializedKey = JSON.stringify(
    resolvedParams,
    Object.keys(resolvedParams).sort(),
  );

  return cache(
    async (): Promise<ProductListResult> => {
      return fetchProductsFromDb(normalizedQuery, resolvedParams);
    },
    // Bump the version when the filtering logic or result shape changes,
    // so old cache entries are skipped.
    ["products", "search", "v5", normalizedQuery, serializedKey],
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
