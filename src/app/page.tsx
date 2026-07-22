"use client";
import Footer from "@/components/Footer";

import { type Product } from "@/schemas/products";

import Carousel from "@/components/Carousel";
import styles from "./page.module.css";
import CategorySection from "@/components/CategorySection";
import CollectionSection from "@/components/CollectionSection";
import DealSection from "@/components/DealSection";
import BrandSection from "@/components/BrandSection";
import Blog from "@/components/Blog";

export default function Home() {
  return (
    <>
      <Carousel />
      <CategorySection />
      <CollectionSection />
      <DealSection />
      <BrandSection />
      <Blog />
      <Footer />
    </>
  );
}
