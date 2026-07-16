"use client";
import Footer from "@/components/Footer";

import { type Product } from "@/schemas/products";

import Carousel from "@/components/Carousel";
import styles from "./page.module.css";
import CategorySection from "@/components/CategorySection";
import CollectionSection from "@/components/CollectionSection";
import DealSection from "@/components/DealSection";

export default function Home() {
  return (
    <>
      <Carousel />
      <CategorySection />
      <CollectionSection />
      <DealSection />
      <Footer />
    </>
  );
}
