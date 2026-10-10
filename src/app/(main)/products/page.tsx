import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, Sparkles, X } from "lucide-react";
import styles from "./products.module.css";
import {
  ProductCard,
  ProductSkeleton,
} from "@/src/components/ProductCard/ProductCard";
import { Suspense } from "react";
import FilterPanel from "@/src/components/ProductFilter/FilterPanel";
import Footer from "@/src/components/Footer/Footer";
import { getFilterOptions, getProducts, SORT_OPTIONS } from "@/lib/db/products";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    size?: string | string[];
    color?: string | string[];
    priceGroup?: string | string[];
    type?: string | string[];
    brand?: string | string[];
    sort?: string;
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
  const { products, correctedQuery } = await getProducts(
    searchQuery,
    searchParams,
  );

  // Same URL without the search term, so filters and sort stay applied.
  const resolvedParams = await searchParams;
  const withoutSearch = new URLSearchParams();
  for (const [key, value] of Object.entries(resolvedParams)) {
    if (key === "search" || value === undefined) continue;
    for (const item of [value].flat()) withoutSearch.append(key, item);
  }
  const clearSearchQuery = withoutSearch.toString();
  const clearSearchHref = (
    clearSearchQuery ? `/products?${clearSearchQuery}` : "/products"
  ) as Route;

  const clearSearch = (
    <Link
      href={clearSearchHref}
      scroll={false}
      className={styles.clearSearch}
      aria-label={`Clear search for ${searchQuery}`}
      title="Clear search"
    >
      <X size={14} aria-hidden="true" />
    </Link>
  );

  return (
    <>
      {correctedQuery ? (
        <p className={styles.searchStatus}>
          No results for &ldquo;{searchQuery}&rdquo;. Showing results for
          &ldquo;<strong>{correctedQuery}</strong>&rdquo; instead.
          {clearSearch}
        </p>
      ) : (
        searchQuery && (
          <p className={styles.searchStatus}>
            Showing results for: &ldquo;<strong>{searchQuery}</strong>&rdquo;
            {clearSearch}
          </p>
        )
      )}

      <p className={styles.resultCount} aria-live="polite">
        {products.length} {products.length === 1 ? "product" : "products"}
      </p>

      <div className={styles.grid}>
        {products.length === 0 ? (
          <div className={styles.searchNoFound}>
            <h3>No items found</h3>
            <p>
              We couldn&apos;t find any products matching your search term or
              active filters.
            </p>
          </div>
        ) : (
          <ProductCard products={products} layout="grid" />
        )}
      </div>
    </>
  );
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const searchQuery = await getSearchQuery(searchParams);
  const filterOptions = await getFilterOptions();

  return (
    <>
      <main className={styles.container}>
        <FilterPanel options={filterOptions} sortOptions={SORT_OPTIONS} />

        {!session?.user && (
          <aside className={styles.signInBanner} aria-label="Sign in for deals">
            <span className={styles.signInIcon} aria-hidden="true">
              <Sparkles size={20} />
            </span>
            <div className={styles.signInText}>
              <p className={styles.signInTitle}>Unlock member-only deals</p>
              <p className={styles.signInSubtitle}>
                Sign in for personalized offers, a saved cart and order
                tracking.
              </p>
            </div>
            <Link href="/auth" className={styles.signInButton}>
              Sign in
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </aside>
        )}

        <Suspense
          fallback={
            <div className={styles.grid}>
              <ProductSkeleton layout="grid" />
            </div>
          }
        >
          <ProductList searchQuery={searchQuery} searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
