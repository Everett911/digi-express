"use client";

import { useMemo } from "react";
import Link from "next/link";
import styles from "./SubHeaderTabs.module.css";
import type { Route } from "next";
import type { TabCategory } from "./types";
import { getCategoryConfig } from "./headerConfig";

interface SubHeaderProps {
  titleTab: TabCategory;
}

export default function SubHeaderTabs({ titleTab }: SubHeaderProps) {
  const config = useMemo(() => getCategoryConfig(titleTab), [titleTab]);
  const categoryKey = titleTab.toLowerCase();

  const essentialLinks = useMemo(
    () =>
      config.types.map((item) => ({
        name: item.name,
        href: `/products?type=${categoryKey}&type=${item.href}`,
      })),
    [config.types, categoryKey]
  );

  const brandLinks = useMemo(
    () =>
      config.brands.map((brand) => ({
        name: brand,
        href: `/products?type=${categoryKey}&brand=${brand}`,
      })),
    [config.brands, categoryKey]
  );

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
        <span className={styles.typeTitle}>{config.essentialLabel}</span>
        <ul className={styles.linkList}>
          {essentialLinks.map((item) => (
            <li key={item.name}>
              <Link href={item.href as Route} className={styles.typeLinks}>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.brand}>
        <span className={styles.brandTitle}>BRANDS</span>
        <ul className={styles.linkList}>
          {brandLinks.map((item) => (
            <li key={item.name}>
              <Link href={item.href as Route} className={styles.brandName}>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
