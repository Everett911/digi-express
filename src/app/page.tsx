"use client";
import Footer from "@/components/Footer";

import { type Product } from "@/schemas/products";

import Carousel from "@/components/Carousel";
import styles from "./page.module.css";
import CategorySection from "@/components/CategorySection";

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
  return (
    <>
      <Carousel />
      <CategorySection />

      <Footer />
    </>
  );
}
