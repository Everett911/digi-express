"use client";
import Footer from "@/components/Footer/Footer";

import { type Product } from "@/schemas/products";

import Carousel from "@/components/Carousel/Carousel";
import styles from "./page.module.css";
import CategorySection from "@/components/Category/CategorySection";
import CollectionSection from "@/components/Collection/CollectionSection";
import DealSection from "@/components/Deal/DealSection";
import BrandSection from "@/components/Brand/BrandSection";
import Blog from "@/components/Blog/Blog";

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
