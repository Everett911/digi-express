"use client";

import { useMemo } from "react";
import Link from "next/link";
import styles from "./SubHeaderTabs.module.css";
import type { Route } from "next";
import type { TabCategory } from "./types";
import { getCategoryConfig } from "./headerConfig";

interface SubHeaderProps {
  titleTab: TabCategory;
  // Called when a link is followed, so the menu can close.
  onNavigate?: () => void;
}

// Builds a /products URL scoped to the department, encoding values such as
// "New Balance" or "Under $75".
function productsHref(category: string, params: [string, string][] = []) {
  const query = new URLSearchParams([["type", category], ...params]);
  return `/products?${query.toString()}` as Route;
}

export default function SubHeaderTabs({ titleTab, onNavigate }: SubHeaderProps) {
  const config = useMemo(() => getCategoryConfig(titleTab), [titleTab]);
  const categoryKey = titleTab.toLowerCase();

  const quickLinks = useMemo(
    () => [
      { name: "NEW ARRIVAL", href: productsHref(categoryKey, [["search", "new"]]) },
      { name: "BESTSELLER", href: productsHref(categoryKey, [["search", "best"]]) },
      {
        name: "DISCOUNTED",
        href: productsHref(categoryKey, [["priceGroup", "Under $75"]]),
      },
      { name: "ALL PRODUCTS", href: "/products" as Route },
    ],
    [categoryKey],
  );

  const essentialLinks = useMemo(
    () =>
      config.types.map((item) => ({
        name: item.name,
        href: productsHref(categoryKey, [["type", item.href]]),
      })),
    [config.types, categoryKey],
  );

  const brandLinks = useMemo(
    () =>
      config.brands.map((brand) => ({
        name: brand,
        href: productsHref(categoryKey, [["brand", brand]]),
      })),
    [config.brands, categoryKey],
  );

  return (
    <nav className={styles.container} aria-label={`${titleTab} sub navigation`}>
      <ul className={styles.titlelinks}>
        {quickLinks.map((item) => (
          <li key={item.name}>
            <Link href={item.href} onClick={onNavigate}>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>

      <div className={styles.type}>
        <span className={styles.typeTitle}>{config.essentialLabel}</span>
        <ul className={styles.linkList}>
          {essentialLinks.map((item) => (
            <li key={item.name}>
              <Link href={item.href} className={styles.typeLinks} onClick={onNavigate}>
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
              <Link href={item.href} className={styles.brandName} onClick={onNavigate}>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <Link href={productsHref(categoryKey)} className={styles.shopAll} onClick={onNavigate}>
        Shop all {titleTab} <span aria-hidden="true">→</span>
      </Link>
    </nav>
  );
}
