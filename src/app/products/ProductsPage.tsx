import axios from "axios";
import { useEffect, useState } from "react";
import { NavLink, useSearchParams } from "react-router";
import { Header } from "../../components/Header";
import { ProductsGrid } from "./ProductsGrid";
import "./ProductsPage.css";
import { type Product, productSchema } from "../../schemas/products";
import Footer from "../../components/Footer";

type Props = {
  totalQuantity: number;
  loadCart: () => Promise<void>;
  products: Product[];
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
};

export function ProductsPage({
  totalQuantity,
  loadCart,
  products,
  setProducts,
}: Props) {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search");

  useEffect(() => {
    const getHomeData = async () => {
      const response = await axios.get("/api/products");
      const data = productSchema.array().parse(response.data);
      setProducts(data);
    };

    const getSearchData = async () => {
      const response = await axios.get(`/api/products?search=${search}`);
      const data = productSchema.array().parse(response.data);

      setProducts(data);
    };

    search ? getSearchData() : getHomeData();
  }, [search, setProducts]);

  return (
    <>
      <title>Ecommerce Project</title>
      <link rel="icon" type="image/svg+xml" href="/home-favicon.png" />
      <Header totalQuantity={totalQuantity} />

      <div className="home-page">
        <ProductsGrid products={products} loadCart={loadCart} />
      </div>
      <Footer />
    </>
  );
}
