import { prisma } from "../prisma";
import { cache } from "@/lib/cache";
import type { Prisma, Product } from "@prisma/client";
import {
  mapPriceGroupsToPrisma,
  PRICE_GROUPS,
  priceGroupToRange,
} from "@/lib/utils/priceMapper";
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
  sort?: string;
};

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A to Z" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

const ORDER_BY: Record<SortOption, Prisma.ProductOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  "price-asc": { priceCents: "asc" },
  "price-desc": { priceCents: "desc" },
  name: { name: "asc" },
};

function parseSort(value: string | undefined): SortOption | null {
  return SORT_OPTIONS.some((option) => option.value === value)
    ? (value as SortOption)
    : null;
}

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
  // Brands are stored with inconsistent casing ("zara", "Daniel Wellington").
  if (brands.length > 0)
    conditions.push({ brand: { in: brands, mode: "insensitive" } });
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

  const sort = parseSort(searchParams.sort);
  const products = await prisma.product.findMany({
    where: { AND: conditions },
    orderBy: ORDER_BY[sort ?? "newest"],
  });

  // Keep search relevance order unless the shopper picked a sort.
  if (!search || sort) return { products, correctedQuery };

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
    ["products", "search", "v6", normalizedQuery, serializedKey],
    {
      revalidate: 60 * 60 * 24,
      tags: ["products"],
    },
  )();
}

export type FilterOption = { value: string; count: number };

export type FilterOptions = {
  sizes: FilterOption[];
  colors: FilterOption[];
  brands: FilterOption[];
  keywords: FilterOption[];
  priceGroups: FilterOption[];
};

type CountRow = { value: string; count: bigint };

// Placeholder stored when a product has no brand, size or color.
const EMPTY_VALUE = "none";
const SIZE_ORDER = ["xxs", "xs", "s", "m", "l", "xl", "xxl", "xxxl"];
const DEPARTMENT_ALIASES = DEPARTMENTS.flatMap((d) => d.aliases);

function toOptions(rows: CountRow[]): FilterOption[] {
  return rows
    .map((row) => ({ value: row.value, count: Number(row.count) }))
    .filter((row) => row.value && row.value !== EMPTY_VALUE);
}

function sizeRank(value: string) {
  const index = SIZE_ORDER.indexOf(value);
  return index === -1 ? SIZE_ORDER.length : index;
}

// Filter choices built from what is actually in the database, with product
// counts, so the panel never offers a value that can't match anything.
export const getFilterOptions = cache(
  async (): Promise<FilterOptions> => {
    const [sizes, colors, keywords, brands, prices] = await Promise.all([
      prisma.$queryRaw<CountRow[]>`
        SELECT lower(trim(v)) AS value, count(DISTINCT p.id) AS count
        FROM "Product" p, unnest(p."size") AS v
        WHERE p."isAvailableForPurchase" = true
        GROUP BY 1 ORDER BY 2 DESC, 1`,
      prisma.$queryRaw<CountRow[]>`
        SELECT lower(trim(v)) AS value, count(DISTINCT p.id) AS count
        FROM "Product" p, unnest(p."color") AS v
        WHERE p."isAvailableForPurchase" = true
        GROUP BY 1 ORDER BY 2 DESC, 1`,
      prisma.$queryRaw<CountRow[]>`
        SELECT lower(trim(v)) AS value, count(DISTINCT p.id) AS count
        FROM "Product" p, unnest(p."keywords") AS v
        WHERE p."isAvailableForPurchase" = true
        GROUP BY 1 ORDER BY 2 DESC, 1`,
      prisma.$queryRaw<CountRow[]>`
        SELECT lower(trim(brand)) AS value, count(*) AS count
        FROM "Product"
        WHERE "isAvailableForPurchase" = true
        GROUP BY 1 ORDER BY 2 DESC, 1`,
      prisma.product.findMany({
        where: { isAvailableForPurchase: true },
        select: { priceCents: true },
      }),
    ]);

    const priceGroups = PRICE_GROUPS.map((group) => {
      const range = priceGroupToRange(group);
      const min = typeof range?.gte === "number" ? range.gte : -Infinity;
      const max = typeof range?.lt === "number" ? range.lt : Infinity;
      const count = prices.filter(
        ({ priceCents }) => priceCents >= min && priceCents < max,
      ).length;
      return { value: group, count };
    });

    return {
      sizes: toOptions(sizes).sort(
        (a, b) => sizeRank(a.value) - sizeRank(b.value),
      ),
      colors: toOptions(colors),
      brands: toOptions(brands),
      // Departments have their own header tabs, so leave them out here.
      keywords: toOptions(keywords).filter(
        (k) => !DEPARTMENT_ALIASES.includes(k.value),
      ),
      priceGroups,
    };
  },
  ["products", "filter-options", "v1"],
  { revalidate: 60 * 60 * 24, tags: ["products"] },
);
