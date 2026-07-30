import styles from "@/app/products/products.module.css";
import Image from "next/image";
import { formatMoney } from "@/utils/money";
import Link from "next/link";
import { Product } from "@/schemas/products";

interface Props {
  products: Product[];
}

export function ProductCard({ products }: Props) {
  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <div key={product.id}>
          <Link href={`/products/${product.id}`} className={styles.linkClick}>
            <div key={product.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <Image
                  src={`/products/${product.image[0]}.png`}
                  alt={product.name}
                  width={320}
                  height={280}
                />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.productName}>{product.name}</h3>
                {product.rating && (
                  <div className={styles.ratingWrapper}>
                    <Image
                      className="product-rating-stars"
                      src={`/ratings/rating-${product.rating.stars * 10}.png`}
                      alt="rating star"
                      width={100}
                      height={20}
                    />
                    <div className="product-rating-count link-primary">
                      ({product.rating.count})
                    </div>
                  </div>
                )}
                <p className={styles.price}>
                  {formatMoney(product.priceCents)}
                </p>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className={styles.grid}>
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
    </div>
  );
}
