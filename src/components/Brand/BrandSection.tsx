import React from "react";
import Link from "next/link";
import {
  SiNike, // Nike
  SiAdidas, // Adidas
  SiPuma, // Puma
  SiUnderarmour, // Under Armour
  SiReebok, // Reebok
  SiNewbalance, // New Balance
  SiZara, // Zara
  SiHandm, // H&M
  SiUniqlo, // Uniqlo
  SiDior, // Dior
} from "@icons-pack/react-simple-icons";

import styles from "./BrandSection.module.css";
import { Route } from "next";

interface BrandItem {
  id: string;
  icon: React.ReactNode;
  href: string;
}

export default function BrandSection() {
  const iconColor = "#3467cc";
  const iconSize = 50;

  const categories: BrandItem[] = [
    {
      id: "1",
      icon: <SiNike size={iconSize} color={iconColor} />,
      href: "/products?brand=nike",
    },
    {
      id: "2",
      icon: <SiAdidas size={iconSize} color={iconColor} />,
      href: "/products?brand=adidas",
    },
    {
      id: "3",
      icon: <SiPuma size={iconSize} color={iconColor} />,
      href: "/products?brand=puma",
    },
    {
      id: "4",
      icon: <SiUnderarmour size={iconSize} color={iconColor} />,
      href: "/products?brand=underarmor",
    },
    {
      id: "5",
      icon: <SiReebok size={iconSize} color={iconColor} />,
      href: "/products?brand=reebok",
    },
    {
      id: "6",
      icon: <SiNewbalance size={iconSize} color={iconColor} />,
      href: "/products?brand=newbalance",
    },
    {
      id: "7",
      icon: <SiZara size={iconSize} color={iconColor} />,
      href: "/products?brand=zara",
    },
    {
      id: "8",
      icon: <SiHandm size={iconSize} color={iconColor} />,
      href: "/products?brand=hm",
    },
    {
      id: "9",
      icon: <SiUniqlo size={iconSize} color={iconColor} />,
      href: "/products?brand=uniqlo",
    },
    {
      id: "10",
      icon: <SiDior size={iconSize} color={iconColor} />,
      href: "/products?brand=dior",
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <h2 className={styles.title}>Shop by Brand</h2>
          <Link href="/products" className={styles.seeAllWrapper}>
            <span className={styles.seeAll}>See All</span>
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
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
