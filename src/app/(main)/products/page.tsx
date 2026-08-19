import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import styles from "./products.module.css";
import {
  ProductCard,
  ProductSkeleton,
} from "@/src/components/ProductCard/ProductCard";
import { Suspense } from "react";
import FilterPanel from "@/src/components/ProductFilter/FilterPanel";
import { getProductCount, getProducts } from "@/lib/db/products";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    size?: string | string[];
    color?: string | string[];
    priceGroup?: string | string[];
    type?: string | string[];
    brand?: string | string[];
  }>;
}

async function getSearchQuery(searchParams: PageProps["searchParams"]) {
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams.search?.trim() || "";
  return searchQuery;
}

async function ProductList({
  searchQuery,
  searchParams,
}: {
  searchQuery: string;
  searchParams: PageProps["searchParams"];
}) {
  const products = await getProducts(searchQuery, searchParams);

  if (products.length === 0) {
    return (
      <div className={styles.searchNoFound}>
        <h3>No items found</h3>
        <p>
          We couldn&apos;t find any products matching your search term or active
          filters.
        </p>
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
  const productCount = await getProductCount();

  return (
    <main className={styles.container}>
      <FilterPanel productCount={productCount} />

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
          <ProductList searchQuery={searchQuery} searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
