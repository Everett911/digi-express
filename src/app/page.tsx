"use client";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { MenuHeader } from "@/components/MenuHeader";
import { productSchema, type Product } from "@/schemas/products";
import axios from "axios";
import { Products } from "./products/Products";
import SeasonCard from "@/components/SeasonCard";
import Carousel from "@/components/Carousel";
import styles from "./page.module.css";

export default function Home({
  totalQuantity,
  products,
  loadCart,
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
  const [active, setActive] = useState<boolean>(false);
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
      <Header
        totalQuantity={totalQuantity}
        active={active}
        setActive={setActive}
      />
      <div>{active && <MenuHeader active={active} />}</div>

      <Carousel />

      <div className={styles["showcase-container"]}>
        <div className="title-link">
          <button
            className={`${styles["showcase-button"]} ${showcaseProduct === "shoes" ? styles.selected : ""}`}
            onClick={() => setShowcaseProduct("shoes")}
          >
            New Brands
          </button>
          <button
            className={`${styles["showcase-button"]} ${showcaseProduct === "clothing" ? styles.selected : ""}`}
            onClick={() => setShowcaseProduct("clothing")}
          >
            Discounts
          </button>
        </div>
        <div className={styles["showcase-product-container"]}>
          <div className={styles["products-grid"]}>
            {/*showcaseProducts.map((product) => (
              <Products
                key={product.id}
                product={product}
                loadCart={loadCart}
              />
            ))*/}
          </div>
        </div>
      </div>
      <div className={styles["card-container"]}>
        <SeasonCard />
      </div>
      <Footer />
    </>
  );
}
