import { prisma } from "../../../../lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

import styles from "./detail.module.css";
import ProductSwiper from "@/components/Carousel/ProductSwiper";
import { CircleArrowLeft } from "lucide-react";
import QuantitySelector from "@/components/QuantitySelector/QuantitySelector";
import { formatMoney } from "@/utils/money";

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: DetailPageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  return (
    <main className={styles.container}>
      <Link href="/products" className={styles.backLink}>
        <CircleArrowLeft
          className={styles.backIcon}
          color="#3467cc"
          size="30"
        />{" "}
        Back
      </Link>

      <div className={styles.layout}>
        <div className={styles.imageContainer}>
          <ProductSwiper images={product.image} />
        </div>

        <div className={styles.details}>
          <h1 className={styles.title}>{product.name}</h1>
          <p className={styles.price}>{formatMoney(product.priceCents)}</p>
          <p className={styles.description}>haha</p>
          <div className={styles.buttonWrapper}>
            <QuantitySelector />
            <button type="button" className={styles.actionButton}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
