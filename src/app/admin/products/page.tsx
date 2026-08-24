import AdminProductsHeader from "../_components/AdminProductsHeader";
import styles from "./page.module.css";
import ButtonLink from "../_components/ButtonLink";
import { Suspense } from "react";
import { ProductTable, ProductTableSkeleton } from "./PageTable";

interface PageProps {
  searchParams: Promise<{ page?: string; limit?: string }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const parsedParams = await searchParams;
  const currentPage = Number(parsedParams.page) || 1;
  const currentLimit = Number(parsedParams.limit) || 10;

  return (
    <>
      <div className={styles.container}>
        <AdminProductsHeader>Products</AdminProductsHeader>
        <ButtonLink>Add Products</ButtonLink>
      </div>

      <Suspense key={currentPage} fallback={<ProductTableSkeleton />}>
        <ProductTable page={currentPage} limit={currentLimit} />
      </Suspense>
    </>
  );
}
