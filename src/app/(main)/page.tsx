import Footer from "@/src/components/Footer/Footer";
import Carousel from "@/src/components/Carousel/Carousel";
import styles from "./page.module.css";
import CategorySection from "@/src/components/Category/CategorySection";
import CollectionSection from "@/src/components/Collection/CollectionSection";
import DealSection from "@/src/components/Deal/DealSection";
import BrandSection from "@/src/components/Brand/BrandSection";
import Blog from "@/src/components/Blog/Blog";
import DraggableGrid from "@/src/components/DraggableGrid/DraggableGrid";
import {
  ProductCard,
  ProductSkeleton,
} from "@/src/components/ProductCard/ProductCard";
import { Suspense } from "react";
import { getNewestProducts } from "@/lib/db/products";

export default async function Home() {
  const newestProduct = await getNewestProducts();
  return (
    <main className="styles.main">
      <Carousel />
      <div className={styles.container}>
        <h2 className={styles.arrivalText}>New Arrivals</h2>
        <DraggableGrid className={styles.grid}>
          <Suspense fallback={<ProductSkeleton />}>
            <ProductCard products={newestProduct} />
          </Suspense>
        </DraggableGrid>
      </div>
      <CategorySection />
      <CollectionSection />
      <DealSection />
      <BrandSection />
      <Blog />
      <Footer />
    </main>
  );
}
