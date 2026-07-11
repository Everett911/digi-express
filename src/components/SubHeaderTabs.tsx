"use client";

import Link from "next/link";
import styles from "./SubHeaderTabs.module.css";

export default function SubHeaderTabs({ type }: { type: string }) {
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
          {type === "men" && (
            <div className={styles.typeTitle}>{`MEN'S ESSENTIAL`}</div>
          )}
          {type === "women" && (
            <div className={styles.typeTitle}>{`WOMEN'S ESSENTIAL`}</div>
          )}
          {type === "appliances" && (
            <div className={styles.typeTitle}>{`HOME'S ESSENTIAL`}</div>
          )}
          {sublinks.map((sublink) => {
            return (
              <div key={sublink} className={styles.typeSublinks}>
                {sublink}
              </div>
            );
          })}
        </div>
        <div className={styles.brand}>
          <div className={styles.brandTitle}>BRANDS</div>
          {subbrands.map((subbrand) => {
            return (
              <div key={subbrand} className={styles.subbrand}>
                {subbrand}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

const sublinks = [
  "🧴 Grooming & Personal Care",
  "👟 Apparel & Footwear",
  "💼 Bags & Accessories",
  "🏋️ Health, Fitness & Wellness",
  "📱 Tech & Gadgets",
];

const subbrands = ["Nike", "Addidas", "Zara", "Uniqlo", "New Balance"];
