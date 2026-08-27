"use client";
import React, { useState, useRef, useEffect } from "react";
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
import { ChevronDown, X } from "lucide-react";

import styles from "./BrandSection.module.css";
import { Route } from "next";

interface BrandItem {
  id: string;
  icon: React.ReactNode;
  href: string;
  name: string;
}

export default function BrandSection() {
  const iconColor = "#3467cc";
  const iconSize = 50;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories: BrandItem[] = [
    {
      id: "1",
      icon: <SiNike size={iconSize} color={iconColor} />,
      href: "/products?brand=nike",
      name: "Nike",
    },
    {
      id: "2",
      icon: <SiAdidas size={iconSize} color={iconColor} />,
      href: "/products?brand=adidas",
      name: "Adidas",
    },
    {
      id: "3",
      icon: <SiPuma size={iconSize} color={iconColor} />,
      href: "/products?brand=puma",
      name: "Puma",
    },
    {
      id: "4",
      icon: <SiUnderarmour size={iconSize} color={iconColor} />,
      href: "/products?brand=underarmor",
      name: "Under Armour",
    },
    {
      id: "5",
      icon: <SiReebok size={iconSize} color={iconColor} />,
      href: "/products?brand=reebok",
      name: "Reebok",
    },
    {
      id: "6",
      icon: <SiNewbalance size={iconSize} color={iconColor} />,
      href: "/products?brand=newbalance",
      name: "New Balance",
    },
    {
      id: "7",
      icon: <SiZara size={iconSize} color={iconColor} />,
      href: "/products?brand=zara",
      name: "Zara",
    },
    {
      id: "8",
      icon: <SiHandm size={iconSize} color={iconColor} />,
      href: "/products?brand=hm",
      name: "H&M",
    },
    {
      id: "9",
      icon: <SiUniqlo size={iconSize} color={iconColor} />,
      href: "/products?brand=uniqlo",
      name: "Uniqlo",
    },
    {
      id: "10",
      icon: <SiDior size={iconSize} color={iconColor} />,
      href: "/products?brand=dior",
      name: "Dior",
    },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <h2 className={styles.title}>Shop by Brand</h2>
          <Link href="/products" className={styles.seeAllWrapper}>
            <span className={styles.seeAll}>See All</span>
          </Link>
        </div>

        <div className={styles.dropdown} ref={dropdownRef}>
          <button
            type="button"
            className={styles.dropdownButton}
            onClick={toggleDropdown}
          >
            <span>{dropdownOpen ? "Hide Brands" : "Select a Brand"}</span>
            {dropdownOpen ? (
              <X size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </button>
          <div
            className={`${styles.dropdownMenu} ${
              dropdownOpen ? styles.dropdownOpen : ""
            }`}
          >
            {categories.map((category) => (
              <Link
                key={category.id}
                href={category.href as Route}
                className={styles.dropdownItem}
                onClick={() => setDropdownOpen(false)}
              >
                <span className={styles.dropdownItemIcon}>
                  {category.icon}
                </span>
                <span>{category.name}</span>
              </Link>
            ))}
          </div>
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
