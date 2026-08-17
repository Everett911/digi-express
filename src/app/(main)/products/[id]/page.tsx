import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetailContent from "./ProductDetailContent";
import styles from "./detail.module.css";
import ProductSwiper from "@/src/components/Carousel/ProductSwiper";
import ProductDescription from "@/src/components/Accordion/ProductDescription";

import ProductCare from "@/src/components/Accordion/ProductCare";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // Next.js 15 requires awaiting params

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <main>
      <div className={styles.container}>
        <div className={styles.backLinkWrapper}>
          <Link className={styles.backLink} href={"/"}>
            Home
          </Link>
          <ChevronLeft />
          <Link className={styles.backLink} href={"/products"}>
            Product
          </Link>
        </div>
        <div className={styles.layout}>
          <div className={styles.imageContainer}>
            <ProductSwiper images={product.image} />
          </div>

          <ProductDetailContent product={product} />
        </div>
        <ProductDescription description={product.description ?? ""} />
        {!["appliances", "appliance"].some((item) =>
          product.keywords.includes(item),
        ) && <ProductCare />}
      </div>
    </main>
  );
}
