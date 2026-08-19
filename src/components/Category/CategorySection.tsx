"use client";
import Link from "next/link";
import {
  Sparkles,
  Watch,
  Shirt,
  Footprints,
  Briefcase,
  FlameKindling,
  Sofa,
  Panda,
} from "lucide-react";
import styles from "./CategorySection.module.css";
import { Route } from "next";

interface CategoryItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  href: string;
}

export default function CategorySection() {
  const iconColor = "#3467cc";
  const iconSize = 20;

  const categories: CategoryItem[] = [
    {
      id: "1",
      name: "Personal Care",
      icon: <Sparkles size={iconSize} color={iconColor} />,

      href: "/products?type=personal-care",
    },
    {
      id: "2",
      name: "Accessories",
      icon: <Watch size={iconSize} color={iconColor} />,
      href: "/products?type=accessories",
    },
    {
      id: "3",
      name: "Clothing",
      icon: <Shirt size={iconSize} color={iconColor} />,

      href: "/products?type=clothing",
    },
    {
      id: "4",
      name: "Furniture",
      icon: <Sofa size={iconSize} color={iconColor} />,
      href: "/products?type=furniture",
    },
    {
      id: "5",
      name: "Outdoors",
      icon: <FlameKindling size={iconSize} color={iconColor} />,
      href: "/products?type=outdoors",
    },
    {
      id: "6",
      name: "Toys",
      icon: <Panda size={iconSize} color={iconColor} />,
      href: "/products?type=toys",
    },
    {
      id: "7",
      name: "Shoes",
      icon: <Footprints size={iconSize} color={iconColor} />,

      href: "/products?type=shoes",
    },
    {
      id: "8",
      name: "Bags",
      icon: <Briefcase size={iconSize} color={iconColor} />,
      href: "/products?type=bags",
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.headerColumn}>
          <span className={styles.title}>Shop by Category</span>
          <Link href="/products" className={styles.seeAll}>
            See all
          </Link>
        </div>

        <div className={styles.grid}>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href as Route}
              className={styles.card}
            >
              <div className={styles.iconWrapper}>{category.icon}</div>
              <span className={styles.label}>{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
