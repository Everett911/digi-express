import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader, Panel } from "../../../_components/ui";
import { requireAdminPage } from "../../../_lib/auth";
import ProductForm from "../../_components/ProductForm";
import styles from "../../form.module.css";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { readOnly } = await requireAdminPage();
  const { id } = await params;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <>
      <PageHeader title="Edit product" description={product.name} />
      <Panel>
        <div className={styles.formBody}>
          <ProductForm product={product} readOnly={readOnly} />
        </div>
      </Panel>
    </>
  );
}
