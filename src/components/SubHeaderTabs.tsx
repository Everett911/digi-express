"use client";

import Link from "next/link";
import styles from "./SubHeaderTabs.module.css";

export default function SubHeaderTabs({ titleTab }: { titleTab: string }) {
  return (
    <>
      <div className={styles.container}>
        <div className={styles.titlelinks}>
          <Link href={"/"}>NEW ARRIVAL</Link>
          <Link href={"/"}>BESTSELLER</Link>
          <Link href={"/"}>DISCOUNTED</Link>
          <Link href={"/"}>BRANDED</Link>
        </div>
        <div className={styles.type}>
          {titleTab === "Men" && (
            <div className={styles.typeTitle}>{`MEN'S ESSENTIAL`}</div>
          )}
          {titleTab === "Women" && (
            <div className={styles.typeTitle}>{`WOMEN'S ESSENTIAL`}</div>
          )}
          {titleTab === "Appliances" && (
            <div className={styles.typeTitle}>{`HOME'S ESSENTIAL`}</div>
          )}
          {links.map((link) => {
            return (
              <div key={link} className={styles.typeLinks}>
                {link}
              </div>
            );
          })}
        </div>
        <div className={styles.brand}>
          <div className={styles.brandTitle}>BRANDS</div>
          {brands.map((brand) => {
            return (
              <div key={brand} className={styles.brandName}>
                {brand}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

const links = [
  "Grooming & Personal Care",
  "Apparel & Footwear",
  "Bags & Accessories",
  "Health, Fitness & Wellness",
  "Tech & Gadgets",
];

const brands = ["Nike", "Addidas", "Zara", "Uniqlo", "New Balance"];
