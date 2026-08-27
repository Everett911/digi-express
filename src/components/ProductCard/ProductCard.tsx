"use client";
import styles from "./ProductCard.module.css";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/src/schemas/products";
import { formatCurrency } from "@/src/utils/formatters";

interface Props {
  products: Product[];
}

export function ProductCard({ products }: Props) {
  if (!products || products.length === 0) {
    return <p className={styles.noProducts}>No popular products found.</p>;
  }
  return (
    <>
      {products.map((product) => {
        const displayImage =
          product.image && product.image.length > 0
            ? product.image[0]
            : "/images/placeholder.jpg";

        return (
          <div key={product.id}>
            <Link
              href={`/products/${product.id}`}
              className={`${styles.linkClick} ${styles.card}`}
            >
              <div className={styles.imageWrapper}>
                <Image
                  src={displayImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 360px) 100vw, (max-width: 720px) 50vw, 33vw"
                  style={{ objectFit: "cover" }}
                  loading="eager"
                  draggable={false}
                />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.price}>
                  {formatCurrency(product.priceCents / 100)}
                </p>
              </div>
            </Link>
          </div>
        );
      })}
    </>
  );
}

export function ProductSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className={`${styles.card} ${styles.skeletonCard}`}>
          <div className={`${styles.imageWrapper} ${styles.skeletonImage}`} />

          <div className={styles.cardContent}>
            <div className={`${styles.skeletonText} ${styles.skeletonTitle}`} />

            <div className={styles.skeletonRatingRow}>
              <div
                className={`${styles.skeletonText} ${styles.skeletonStars}`}
              />
              <div
                className={`${styles.skeletonText} ${styles.skeletonCount}`}
              />
            </div>

            <div className={`${styles.skeletonText} ${styles.skeletonPrice}`} />
          </div>
        </div>
      ))}
    </>
  );
}
