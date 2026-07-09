"use client";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { productSchema, type Product } from "@/schemas/products";
import axios from "axios";
import Carousel from "@/components/Carousel";
import styles from "./page.module.css";

export default function Home({
  setProducts,
}: {
  totalQuantity: number;
  products: Product[];
  loadCart: () => Promise<void>;
  setProducts: React.Dispatch<
    React.SetStateAction<
      {
        id: string;
        image: string;
        name: string;
        rating: {
          stars: number;
          count: number;
        };
        priceCents: number;
        keywords: string[];
      }[]
    >
  >;
}) {
  const [showcaseProduct, setShowcaseProduct] = useState<string>("shoes");
  useEffect(() => {
    const getHomeData = async () => {
      const response = await axios.get("/api/products");
      const data = productSchema.array().parse(response.data);
      setProducts(data);
    };
    getHomeData();
  }, [setProducts]);
  /*
  const showcaseProducts = products
    .filter((product) => {
      if (showcaseProduct === "shoes") {
        return product.keywords.some((keyword) =>
          keyword.toLowerCase().includes("shoes"),
        );
      }

      if (showcaseProduct === "clothing") {
        return product.keywords.some((keyword) =>
          ["apparel", "clothing"].includes(keyword.toLowerCase()),
        );
      }

      return true;
    })
    .slice(0, 5);
  */

  return (
    <>
      <Carousel />
      <div className={styles.showcaseContainer}>
        <div className="title-link">
          <button
            className={`${styles.showcaseButton} ${showcaseProduct === "shoes" ? styles.selected : ""}`}
            onClick={() => setShowcaseProduct("shoes")}
          >
            New Brands
          </button>
          <button
            className={`${styles.showcaseButton} ${showcaseProduct === "clothing" ? styles.selected : ""}`}
            onClick={() => setShowcaseProduct("clothing")}
          >
            Discounts
          </button>
        </div>
        <div className={styles.showcaseProductContainer}>
          <div className={styles.productsGrid}>
            {/*showcaseProducts.map((product) => (
            <Products key={product.id} product={product} loadCart={loadCart} />
          ))*/}
          </div>
        </div>
      </div>
      <div className={styles.cardContainer}></div>
      <Footer />
    </>
  );
}
