"use client";

import Link from "next/link";
import styles from "./SubHeaderTabs.module.css";
import type { Route } from "next";

interface SubHeaderProps {
  titleTab: "Men" | "Women" | "Kids" | "Homewares" | string;
}

const ESSENTIAL_HEADERS: Record<string, string> = {
  men: "MEN'S ESSENTIAL",
  women: "WOMEN'S ESSENTIAL",
  kids: "KID'S ESSENTIAL",
  homewares: "HOMEWARE'S ESSENTIAL",
};

const BRANDS = ["Nike", "Adidas", "Zara", "Uniqlo", "New Balance"];
const TYPE_LINKS = [
  { name: "Grooming & Personal Care", link: "personalcare" },
  { name: "Apparel & Footwear", link: "clothing" },
  { name: "Bags & Accessories", link: "accessories" },
  { name: "Health, Fitness & Wellness", link: "outdoor" },
  { name: "Tech & Gadgets", link: "gadgets" },
];
const HOME_LINKS = [
  "Soft Furnishings and Textiles",
  "Decorative Accessories",
  "Kitchen and Diningware",
  "Appliances",
];

export default function SubHeaderTabs({ titleTab }: SubHeaderProps) {
  const categoryKey = titleTab.toLowerCase();
  const activeHeader =
    ESSENTIAL_HEADERS[categoryKey] || `${titleTab.toUpperCase()}'S ESSENTIAL`;
  const essentialLinks = categoryKey === "homewares" ? HOME_LINKS : TYPE_LINKS;

  return (
    <nav className={styles.container} aria-label={`${titleTab} sub navigation`}>
      <ul className={styles.titlelinks}>
        <li>
          <Link href={"/products?search=new" as Route}>NEW ARRIVAL</Link>
        </li>
        <li>
          <Link href={"/products?search=best" as Route}>BESTSELLER</Link>
        </li>
        <li>
          <Link href={"/products?priceGroup=Under $75" as Route}>
            DISCOUNTED
          </Link>
        </li>
        <li>
          <Link href={"/products" as Route}>ALL PRODUCTS</Link>
        </li>
      </ul>

      <div className={styles.type}>
        <span className={styles.typeTitle}>{activeHeader}</span>
        <ul className={styles.linkList}>
          {essentialLinks.map((item) => {
            const isObject = typeof item !== "string";
            const displayName = isObject ? item.name : item;

            const queryToken = isObject ? item.link : item.toLowerCase();
            const targetUrl = `/products?type=${categoryKey},${queryToken}`;

            return (
              <li key={displayName}>
                <Link href={targetUrl as Route} className={styles.typeLinks}>
                  {displayName}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className={styles.brand}>
        <span className={styles.brandTitle}>BRANDS</span>
        <ul className={styles.linkList}>
          {BRANDS.map((brand) => (
            <li key={brand}>
              <Link
                href={`/products?type=${categoryKey}&brand=${brand}` as Route}
                className={styles.brandName}
              >
                {brand}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
