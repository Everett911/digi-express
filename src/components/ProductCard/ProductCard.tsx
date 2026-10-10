"use client";
import styles from "./ProductCard.module.css";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@prisma/client";
import { formatCurrency } from "@/src/utils/formatters";
import { swatchColor } from "@/src/components/Button/ColorButton";
import { ImageOff } from "lucide-react";

// "row": fixed-width cards for horizontal scrolling rows.
// "grid": cards fill their grid column (products page).
type CardLayout = "row" | "grid";

interface Props {
  products: Product[];
  layout?: CardLayout;
}

const MAX_SWATCHES = 4;
const NEW_FOR_DAYS = 30;
const SIZE_ORDER = ["xxs", "xs", "s", "m", "l", "xl", "xxl", "xxxl"];
const IMAGE_SIZES =
  "(max-width: 360px) 100vw, (max-width: 720px) 50vw, 33vw";

// "none" is stored when a product has no colour or size.
function realOptions(values: string[]) {
  return values.filter((value) => value && value.toLowerCase() !== "none");
}

// "XS–XL" for clothing sizes, otherwise a count such as "3 sizes".
function sizeSummary(sizes: string[]) {
  if (sizes.length === 0) return null;
  if (sizes.length === 1) return sizes[0].toUpperCase();

  const ranks = sizes.map((size) => SIZE_ORDER.indexOf(size.toLowerCase()));
  if (ranks.every((rank) => rank !== -1)) {
    const first = SIZE_ORDER[Math.min(...ranks)];
    const last = SIZE_ORDER[Math.max(...ranks)];
    return `${first.toUpperCase()}–${last.toUpperCase()}`;
  }
  return `${sizes.length} sizes`;
}

function isNew(createdAt: Date) {
  const ageMs = Date.now() - new Date(createdAt).getTime();
  return ageMs < NEW_FOR_DAYS * 24 * 60 * 60 * 1000;
}

export function ProductCard({ products, layout = "row" }: Props) {
  if (!products || products.length === 0) {
    return <p className={styles.noProducts}>No products found.</p>;
  }
  return (
    <>
      {products.map((product) => {
        const [displayImage, hoverImage] = product.image ?? [];
        const colors = realOptions(product.color);
        const sizes = sizeSummary(realOptions(product.size));
        const extraColors = colors.length - MAX_SWATCHES;

        return (
          <div key={product.id} className={styles[layout]}>
            <Link
              href={`/products/${product.id}`}
              className={`${styles.linkClick} ${styles.card}`}
            >
              <div className={styles.imageWrapper}>
                {displayImage ? (
                  <>
                    <Image
                      src={displayImage}
                      alt={product.name}
                      fill
                      sizes={IMAGE_SIZES}
                      className={styles.image}
                      loading="eager"
                      draggable={false}
                    />
                    {hoverImage && (
                      // Second photo, shown on hover or keyboard focus.
                      <Image
                        src={hoverImage}
                        alt=""
                        fill
                        sizes={IMAGE_SIZES}
                        className={`${styles.image} ${styles.hoverImage}`}
                        draggable={false}
                      />
                    )}
                  </>
                ) : (
                  // No image uploaded yet: show a neutral tile, not a broken image.
                  <div
                    className={styles.imagePlaceholder}
                    role="img"
                    aria-label={product.name}
                  >
                    <ImageOff size={32} aria-hidden="true" />
                  </div>
                )}
                {isNew(product.createdAt) && (
                  <span className={styles.newTag}>New</span>
                )}
              </div>

              <div className={styles.cardContent}>
                {/* Always rendered so names line up across a row. */}
                <p className={styles.brand}>
                  {product.brand && product.brand !== "none"
                    ? product.brand
                    : " "}
                </p>
                <h3 className={styles.productName}>{product.name}</h3>

                {(colors.length > 0 || sizes) && (
                  <div className={styles.options}>
                    {colors.length > 0 && (
                      <span className={styles.swatches}>
                        <span className={styles.srOnly}>
                          {`Colors: ${colors.join(", ")}.`}
                        </span>
                        {colors.slice(0, MAX_SWATCHES).map((color) => (
                          <span
                            key={color}
                            aria-hidden="true"
                            className={styles.swatch}
                            style={{ backgroundColor: swatchColor(color) }}
                          />
                        ))}
                        {extraColors > 0 && (
                          <span aria-hidden="true" className={styles.moreColors}>
                            +{extraColors}
                          </span>
                        )}
                      </span>
                    )}
                    {sizes && (
                      <span className={styles.sizes}>
                        <span className={styles.srOnly}>Sizes: </span>
                        {sizes}
                      </span>
                    )}
                  </div>
                )}

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

export function ProductSkeleton({ layout = "row" }: { layout?: CardLayout }) {
  return (
    <>
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className={`${styles[layout]} ${styles.card} ${styles.skeletonCard}`}
          aria-hidden="true"
        >
          <div className={`${styles.imageWrapper} ${styles.skeletonBlock}`} />

          <div className={styles.cardContent}>
            <div className={`${styles.skeletonBlock} ${styles.skeletonBrand}`} />
            <div className={`${styles.skeletonBlock} ${styles.skeletonTitle}`} />
            <div className={`${styles.skeletonBlock} ${styles.skeletonOptions}`} />
            <div className={`${styles.skeletonBlock} ${styles.skeletonPrice}`} />
          </div>
        </div>
      ))}
    </>
  );
}
