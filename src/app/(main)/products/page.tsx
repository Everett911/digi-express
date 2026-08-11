import { prisma } from "../../../lib/prisma";
import { buildProductSearchWhere } from "../../../lib/products-search";
import { auth } from "../../../lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import styles from "./products.module.css";
import {
  ProductCard,
  ProductSkeleton,
} from "@/components/ProductCard/ProductCard";
import { Product } from "@/schemas/products";
import { Suspense } from "react";

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

async function getSearchQuery(searchParams: PageProps["searchParams"]) {
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams.search?.trim() || "";
  return searchQuery;
}

async function getSearchProducts(searchQuery: string) {
  const databaseProducts = await prisma.product.findMany({
    where: buildProductSearchWhere(searchQuery),
    orderBy: { createdAt: "desc" },
  });
  return databaseProducts as unknown as Product[];
}

async function ProductList({ searchQuery }: { searchQuery: string }) {
  const products = await getSearchProducts(searchQuery);

  if (products.length === 0) {
    return (
      <div className={styles.noResults}>
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
        <p className={styles.welcomeText}>
          Welcome back, <strong>{session.user.name}</strong>!
        </p>
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

      <Suspense fallback={<ProductSkeleton />}>
        <ProductList searchQuery={searchQuery} />
      </Suspense>
    </main>
  );
}
