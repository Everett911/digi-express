"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import styles from "./FilterPanel.module.css";
import { SlidersHorizontalIcon, X } from "lucide-react";
import { Route } from "next";

type Props = {
  productCount: {
    onactiveCount: number;
    offactiveCount: number;
  };
};

export default function FilterPanel({ productCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const selectedSizes = searchParams.getAll("size");
  const selectedColors = searchParams.getAll("color");
  const selectedPrices = searchParams.getAll("priceGroup");
  const selectedTypes = searchParams.getAll("type");
  const selectedBrands = searchParams.getAll("brand");

  const toggleArrayItem = (
    value: string,
    currentList: string[],
    paramKey: string,
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    const nextList = currentList.includes(value)
      ? currentList.filter((item) => item !== value)
      : [...currentList, value];

    params.delete(paramKey);
    nextList.forEach((val) => params.append(paramKey, val));

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}` as Route, {
        scroll: false,
      });
    });
  };

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const colors = [
    { name: "Black", hex: "#000000" },
    { name: "Grey", hex: "#7E8388" },
    { name: "White", hex: "#FFFFFF", border: true },
    { name: "Beige", hex: "#F3E5D8" },
    { name: "Brown", hex: "#8B4513" },
    { name: "Red", hex: "#E52521" },
    { name: "Pink", hex: "#FF8DC6" },
    { name: "Yellow", hex: "#FFCC00" },
    { name: "Green", hex: "#00A859" },
    { name: "Blue", hex: "#2351A9" },
    { name: "Purple", hex: "#92278F" },
  ];
  const priceRanges = [
    "Under $75",
    "$76 - $100",
    "$101 - $125",
    "$126 - $150",
    "Over $150",
  ];
  const Keywords = [
    "Everyday Sneakers",
    "Flats",
    "High Tops",
    "Hiking Shoes",
    "Long Sleeve Tees",
    "Running Shoes",
    "Shirts",
    "Slip Ons",
    "Slippers",
    "Socks",
    "Sweatpants",
    "Sweatshirts",
    "Tees",
    "Underwear",
    "Water-Repellent Shoes",
  ];
  const brands = [
    "Alternative-Leather",
    "Canvas",
    "Corduroy",
    "Cotton",
    "Luxe-Collection",
    "Plant",
    "Sugar",
    "Tree",
    "Tree-Fiber-Blend",
    "Trino-Jersey",
    "Trino-Knit",
    "Wool",
  ];

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className={styles.expandButton}>
        <SlidersHorizontalIcon size={20} />({productCount.onactiveCount}{" "}
        products)
      </button>
    );
  }

  return (
    <div
      className={`${styles.filterContainer} ${isPending ? styles.pending : ""}`}
    >
      <div className={styles.header}>
        <button
          onClick={() => setIsOpen(false)}
          className={styles.collapseButton}
        >
          <X />
        </button>
        <span className={styles.productCount}>
          ({productCount.onactiveCount} products)
        </span>
      </div>

      <div className={styles.panelGrid}>
        {/* SIZE GRID SECTION */}
        <div className={styles.column}>
          <h4 className={styles.columnTitle}>SIZE</h4>
          <p className={styles.columnDescription}>
            Most of our shoes only come in full sizes. If youre a half size,
            select your nearest whole size too.
          </p>
          <div className={styles.sizeGrid}>
            {sizes.map((size) => {
              const active = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleArrayItem(size, selectedSizes, "size")}
                  className={`${styles.sizeButton} ${active ? styles.sizeButtonActive : ""}`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.column}>
          <h4 className={styles.columnTitle}>COLOR</h4>
          <div className={styles.colorGrid}>
            {colors.map((color) => {
              const active = selectedColors.includes(color.name);
              return (
                <button
                  key={color.name}
                  type="button"
                  onClick={() =>
                    toggleArrayItem(color.name, selectedColors, "color")
                  }
                  className={styles.colorRowButton}
                >
                  <span
                    style={{ backgroundColor: color.hex }}
                    className={`${styles.colorSwatch} ${color.border ? styles.colorSwatchBorder : ""} ${active ? styles.colorSwatchActive : ""}`}
                  />
                  <span
                    className={active ? styles.labelActive : styles.labelNormal}
                  >
                    {color.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.column}>
          <h4 className={styles.columnTitle}>PRICE</h4>
          <div className={styles.checkboxList}>
            {priceRanges.map((price) => (
              <label key={price} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedPrices.includes(price)}
                  onChange={() =>
                    toggleArrayItem(price, selectedPrices, "priceGroup")
                  }
                  className={styles.checkboxInput}
                />
                {price}
              </label>
            ))}
          </div>
        </div>
        <div className={styles.column}>
          <h4 className={styles.columnTitle}>PRODUCT TYPE</h4>
          <div className={styles.checkboxList}>
            {Keywords.map((type) => (
              <label key={type} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={() => toggleArrayItem(type, selectedTypes, "type")}
                  className={styles.checkboxInput}
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.column}>
          <h4 className={styles.columnTitle}>Brand</h4>
          <div className={styles.checkboxList}>
            {brands.map((brand) => (
              <label key={brand} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() =>
                    toggleArrayItem(brand, selectedBrands, "brand")
                  }
                  className={styles.checkboxInput}
                />
                {brand}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
