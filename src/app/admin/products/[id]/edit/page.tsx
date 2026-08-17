import AdminProductsHeader from "@/src/app/admin/_components/AdminProductsHeader";
import ProductForm from "../../_components/ProductForm";
import { notFound } from "next/navigation";
import { prisma } from "../../../../../../lib/prisma";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id?: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  if (!id) {
    notFound();
  }

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    console.log("no product id");
    notFound();
  }

  return (
    <>
      <AdminProductsHeader>Update Product</AdminProductsHeader>
      <ProductForm product={product} />
    </>
  );
}
