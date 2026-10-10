import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetailContent, { type DeliveryEstimate } from "./ProductDetailContent";
import styles from "./detail.module.css";
import ProductSwiper from "@/src/components/Carousel/ProductSwiper";
import ProductDescription from "@/src/components/Accordion/ProductDescription";

import ProductCare from "@/src/components/Accordion/ProductCare";
import DraggableGrid from "@/src/components/DraggableGrid/DraggableGrid";
import { ProductCard } from "@/src/components/ProductCard/ProductCard";
import { getDeliveryOptions } from "@/lib/db/deliveryoptions";
import { addDays, formatDate } from "@/src/utils/formatters";
import Link from "next/link";
import type { Route } from "next";
import { ChevronRight } from "lucide-react";

const RELATED_LIMIT = 8;

// Keywords that say who a product is for rather than what it is.
const AUDIENCE_KEYWORDS = ["men", "women", "kid", "kids", "unisex"];

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // Next.js 15 requires awaiting params

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  const keywords = product.keywords.map((keyword) => keyword.toLowerCase());
  const isAppliance = ["appliances", "appliance"].some((item) =>
    keywords.includes(item),
  );
  const sizes = product.size.filter((size) => size && size !== "none");
  const colors = product.color.filter((color) => color && color !== "none");

  const [deliveryOptions, candidates] = await Promise.all([
    getDeliveryOptions(),
    prisma.product.findMany({
      where: {
        id: { not: product.id },
        isAvailableForPurchase: true,
        keywords: { hasSome: product.keywords },
      },
      take: 40,
    }),
  ]);

  // Cheapest first, with the date each option would arrive if ordered today.
  const today = new Date();
  const deliveryEstimates: DeliveryEstimate[] = [...deliveryOptions]
    .sort((a, b) => a.priceCents - b.priceCents)
    .map((option) => ({
      id: option.id,
      priceCents: option.priceCents,
      arrival: formatDate(addDays(today, option.deliveryDays)),
    }));

  // A shared category ("boots") counts more than a shared audience
  // ("women"); same brand breaks ties.
  const relatedProducts = candidates
    .map((candidate) => ({
      candidate,
      score: candidate.keywords
        .map((k) => k.toLowerCase())
        .filter((k) => keywords.includes(k))
        .reduce((sum, k) => sum + (AUDIENCE_KEYWORDS.includes(k) ? 1 : 3), 0)
        + (candidate.brand === product.brand ? 0.5 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, RELATED_LIMIT)
    .map(({ candidate }) => candidate);

  const audience = keywords.filter((k) => AUDIENCE_KEYWORDS.includes(k));
  const categories = keywords.filter((k) => !AUDIENCE_KEYWORDS.includes(k));

  return (
    <main>
      <div className={styles.container}>
        <nav aria-label="Breadcrumb" className={styles.backLinkWrapper}>
          <Link className={styles.backLink} href={"/"}>
            Home
          </Link>
          <ChevronRight size={16} aria-hidden="true" />
          <Link className={styles.backLink} href={"/products"}>
            Products
          </Link>
          <ChevronRight size={16} aria-hidden="true" />
          <span className={styles.currentCrumb} aria-current="page">
            {product.name}
          </span>
        </nav>
        <div className={styles.layout}>
          <div className={styles.imageContainer}>
            <ProductSwiper images={product.image} />
          </div>

          <ProductDetailContent
            product={product}
            sizes={sizes}
            colors={colors}
            deliveryEstimates={deliveryEstimates}
          />
        </div>

        <section className={styles.specs} aria-labelledby="specs-title">
          <h2 id="specs-title" className={styles.sectionTitle}>
            Product details
          </h2>
          <dl className={styles.specList}>
            <div>
              <dt>Brand</dt>
              <dd>
                <Link
                  className={styles.specLink}
                  href={
                    `/products?brand=${encodeURIComponent(product.brand)}` as Route
                  }
                >
                  {capitalize(product.brand)}
                </Link>
              </dd>
            </div>
            {audience.length > 0 && (
              <div>
                <dt>For</dt>
                <dd>{audience.map(capitalize).join(", ")}</dd>
              </div>
            )}
            {categories.length > 0 && (
              <div>
                <dt>Category</dt>
                <dd className={styles.tagList}>
                  {categories.map((category) => (
                    <Link
                      key={category}
                      className={styles.tag}
                      href={
                        `/products?type=${encodeURIComponent(category)}` as Route
                      }
                    >
                      {capitalize(category)}
                    </Link>
                  ))}
                </dd>
              </div>
            )}
            {colors.length > 0 && (
              <div>
                <dt>Colors</dt>
                <dd>{colors.map(capitalize).join(", ")}</dd>
              </div>
            )}
            {sizes.length > 0 && (
              <div>
                <dt>Sizes</dt>
                <dd>{sizes.map((size) => size.toUpperCase()).join(", ")}</dd>
              </div>
            )}
            <div>
              <dt>Item code</dt>
              <dd>{product.id.slice(0, 8).toUpperCase()}</dd>
            </div>
          </dl>
        </section>

        <ProductDescription description={product.description ?? ""} />
        {!isAppliance && <ProductCare />}

        {relatedProducts.length > 0 && (
          <section className={styles.related} aria-labelledby="related-title">
            <h2 id="related-title" className={styles.sectionTitle}>
              You may also like
            </h2>
            <DraggableGrid className={styles.relatedGrid}>
              <ProductCard products={relatedProducts} />
            </DraggableGrid>
          </section>
        )}
      </div>
    </main>
  );
}
