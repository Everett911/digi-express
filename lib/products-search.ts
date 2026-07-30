import type { Prisma } from "../.prisma/client/client";

export function buildProductSearchWhere(
  searchQuery: string,
): Prisma.ProductWhereInput {
  const trimmed = searchQuery.trim();

  if (!trimmed) {
    return {};
  }

  return {
    OR: [
      { name: { contains: trimmed, mode: "insensitive" as const } },
      { keywords: { has: trimmed } as const },
    ],
  };
}
