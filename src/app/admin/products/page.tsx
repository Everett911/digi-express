import { Suspense } from "react";
import { Plus } from "lucide-react";
import { ButtonLink, PageHeader, Panel } from "../_components/ui";
import { requireAdminPage } from "../_lib/auth";
import { parsePage } from "../_lib/pagination";
import { ProductTable, ProductTableSkeleton } from "./ProductTable";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const { readOnly } = await requireAdminPage();
  const page = parsePage((await searchParams).page);

  return (
    <>
      <PageHeader
        title="Products"
        description="Add, edit and publish the products in your store."
        action={
          !readOnly && (
            <ButtonLink href="/admin/products/new" icon={Plus}>
              Add product
            </ButtonLink>
          )
        }
      />
      <Panel>
        <Suspense key={page} fallback={<ProductTableSkeleton />}>
          <ProductTable page={page} readOnly={readOnly} />
        </Suspense>
      </Panel>
    </>
  );
}
