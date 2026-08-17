import { prisma } from "../../../../lib/prisma";
import { buildProductSearchWhere } from "../../../../lib/products-search";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import styles from "./products.module.css";
import {
  ProductCard,
  ProductSkeleton,
} from "@/src/components/ProductCard/ProductCard";
import { Product } from "@/src/schemas/products";
import { Suspense } from "react";
import { cache } from "@/lib/cache";

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

async function getSearchQuery(searchParams: PageProps["searchParams"]) {
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams.search?.trim() || "";
  return searchQuery;
}

export const getSearchProducts = (searchQuery: string) =>
  cache(
    async (): Promise<Product[]> => {
      return prisma.product.findMany({
        where: buildProductSearchWhere(searchQuery),
        orderBy: { createdAt: "desc" },
      });
    },
    ["products", "search", searchQuery],
    {
      revalidate: 60 * 60 * 24,
      tags: ["products"],
    },
  )();

async function ProductList({ searchQuery }: { searchQuery: string }) {
  const products = await getSearchProducts(searchQuery);

  if (products.length === 0) {
    return (
      <div className={styles.searchNoFound}>
        <h3>No items found</h3>
        <p>We couldn&apos;t find any products matching your search term.</p>
      </div>
    );
  }

  return <ProductCard products={products} />;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const searchQuery = await getSearchQuery(searchParams);

  return (
    <main className={styles.container}>
      {session?.user ? (
        ""
      ) : (
        <p className={styles.welcomeText}>
          Want personalized deals?{" "}
          <Link href="/auth" style={{ color: "#3467cc" }}>
            Sign in
          </Link>
        </p>
      )}

      {searchQuery && (
        <p className={styles.searchStatus}>
          Showing results for: &ldquo;<strong>{searchQuery}</strong>&rdquo;
        </p>
      )}
      <div className={styles.grid}>
        <Suspense fallback={<ProductSkeleton />}>
          <ProductList searchQuery={searchQuery} />
        </Suspense>
      </div>
    </main>
  );
}
