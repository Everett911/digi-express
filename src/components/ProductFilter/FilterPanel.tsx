"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import styles from "./FilterPanel.module.css";
import { SlidersHorizontalIcon, X, ChevronDown } from "lucide-react";
import type { Route } from "next";
import type { FilterOption, FilterOptions } from "@/lib/db/products";

type SortChoice = { value: string; label: string };

type Props = {
  options: FilterOptions;
  sortOptions: readonly SortChoice[];
};

type FilterKey = "size" | "color" | "priceGroup" | "type" | "brand";

const FILTER_LABELS: Record<FilterKey, string> = {
  size: "Size",
  color: "Color",
  priceGroup: "Price",
  type: "Type",
  brand: "Brand",
};

const DEPARTMENTS = ["men", "women", "kids", "homewares", "homeware"];

// Swatches for the color names stored in the database. Unknown colors fall
// back to a neutral swatch rather than being hidden.
const COLOR_HEX: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",
  gray: "#7e8388",
  grey: "#7e8388",
  beige: "#f3e5d8",
  tan: "#d2b48c",
  camel: "#c19a6b",
  brown: "#8b4513",
  "dark brown": "#5c3317",
  brandy: "#87413f",
  red: "#e52521",
  pink: "#ff8dc6",
  yellow: "#ffcc00",
  gold: "#d4af37",
  green: "#00a859",
  blue: "#2351a9",
  "navy blue": "#1f2a5a",
  navy: "#1f2a5a",
  purple: "#92278f",
};
const LIGHT_COLORS = new Set(["white", "beige"]);

// Long lists show this many options until "Show more" is pressed.
const COLLAPSED_LIMIT = 8;

function titleCase(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

const sameValue = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

export default function FilterPanel({ options, sortOptions }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState<Partial<Record<FilterKey, boolean>>>(
    {}
  );

  // Selections update instantly while the new product list loads.
  const [optimisticQuery, setOptimisticQuery] = useOptimistic(
    searchParams.toString()
  );
  const params = new URLSearchParams(optimisticQuery);

  const selected = (key: FilterKey) => params.getAll(key);
  const isSelected = (key: FilterKey, value: string) =>
    selected(key).some((item) => sameValue(item, value));

  const navigate = (next: URLSearchParams) => {
    const query = next.toString();
    startTransition(() => {
      setOptimisticQuery(query);
      router.push((query ? `${pathname}?${query}` : pathname) as Route, {
        scroll: false,
      });
    });
  };

  const toggle = (key: FilterKey, value: string) => {
    const next = new URLSearchParams(optimisticQuery);
    const current = next.getAll(key);
    const updated = current.some((item) => sameValue(item, value))
      ? current.filter((item) => !sameValue(item, value))
      : [...current, value];

    next.delete(key);
    updated.forEach((item) => next.append(key, item));
    navigate(next);
  };

  const setSort = (value: string) => {
    const next = new URLSearchParams(optimisticQuery);
    if (value === "newest") next.delete("sort");
    else next.set("sort", value);
    navigate(next);
  };

  // Clears filters but keeps the search term.
  const clearAll = () => {
    const next = new URLSearchParams();
    const search = params.get("search");
    if (search) next.set("search", search);
    const sort = params.get("sort");
    if (sort) next.set("sort", sort);
    navigate(next);
  };

  const activeFilters = (Object.keys(FILTER_LABELS) as FilterKey[]).flatMap(
    (key) =>
      selected(key).map((value) => ({
        key,
        value,
        label:
          key === "type" && DEPARTMENTS.includes(value.toLowerCase())
            ? `Department: ${titleCase(value)}`
            : `${FILTER_LABELS[key]}: ${key === "size" ? value.toUpperCase() : titleCase(value)}`,
      }))
  );

  const renderShowMore = (key: FilterKey, list: FilterOption[]) =>
    list.length > COLLAPSED_LIMIT && (
      <button
        type="button"
        className={styles.showMore}
        onClick={() => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))}
        aria-expanded={!!expanded[key]}
      >
        {expanded[key] ? "Show less" : `Show ${list.length - COLLAPSED_LIMIT} more`}
      </button>
    );

  const visible = (key: FilterKey, list: FilterOption[]) =>
    expanded[key] ? list : list.slice(0, COLLAPSED_LIMIT);

  const renderCheckboxes = (key: FilterKey, list: FilterOption[]) => (
    <>
      <div className={styles.checkboxList}>
        {visible(key, list).map((option) => {
          const checked = isSelected(key, option.value);
          return (
            <label
              key={option.value}
              className={`${styles.checkboxLabel} ${option.count === 0 && !checked ? styles.disabled : ""}`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={option.count === 0 && !checked}
                onChange={() => toggle(key, option.value)}
                className={styles.checkboxInput}
              />
              <span className={checked ? styles.labelActive : undefined}>
                {key === "priceGroup" ? option.value : titleCase(option.value)}
              </span>
              <span className={styles.optionCount}>{option.count}</span>
            </label>
          );
        })}
      </div>
      {renderShowMore(key, list)}
    </>
  );

  const currentSort = params.get("sort") ?? "newest";

  return (
    <section
      className={`${styles.wrapper} ${isPending ? styles.pending : ""}`}
      aria-label="Product filters"
      aria-busy={isPending}
    >
      <div className={styles.toolbar}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={styles.expandButton}
          aria-expanded={isOpen}
          aria-controls="filter-panel"
        >
          <SlidersHorizontalIcon size={18} />
          Filters
          {activeFilters.length > 0 && (
            <span className={styles.badge}>{activeFilters.length}</span>
          )}
          <ChevronDown
            size={16}
            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          />
        </button>

        <label className={styles.sortLabel}>
          <span>Sort by</span>
          <select
            className={styles.sortSelect}
            value={currentSort}
            onChange={(e) => setSort(e.target.value)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {activeFilters.length > 0 && (
        <ul className={styles.chipList} aria-label="Active filters">
          {activeFilters.map((filter) => (
            <li key={`${filter.key}-${filter.value}`}>
              <button
                type="button"
                className={styles.chip}
                onClick={() => toggle(filter.key, filter.value)}
                aria-label={`Remove ${filter.label}`}
              >
                {filter.label}
                <X size={14} />
              </button>
            </li>
          ))}
          <li>
            <button type="button" className={styles.clearAll} onClick={clearAll}>
              Clear all
            </button>
          </li>
        </ul>
      )}

      {isOpen && (
        <div id="filter-panel" className={styles.filterContainer}>
          <div className={styles.panelGrid}>
            {options.sizes.length > 0 && (
              <fieldset className={styles.column}>
                <legend className={styles.columnTitle}>Size</legend>
                <div className={styles.sizeGrid}>
                  {options.sizes.map((option) => {
                    const active = isSelected("size", option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => toggle("size", option.value)}
                        aria-pressed={active}
                        title={`${option.count} products`}
                        className={`${styles.sizeButton} ${active ? styles.sizeButtonActive : ""}`}
                      >
                        {option.value.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {options.colors.length > 0 && (
              <fieldset className={styles.column}>
                <legend className={styles.columnTitle}>Color</legend>
                <div className={styles.colorGrid}>
                  {visible("color", options.colors).map((option) => {
                    const active = isSelected("color", option.value);
                    const hex = COLOR_HEX[option.value];
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => toggle("color", option.value)}
                        aria-pressed={active}
                        className={styles.colorRowButton}
                      >
                        <span
                          style={hex ? { backgroundColor: hex } : undefined}
                          className={`${styles.colorSwatch} ${!hex ? styles.colorSwatchUnknown : ""} ${!hex || LIGHT_COLORS.has(option.value) ? styles.colorSwatchBorder : ""} ${active ? styles.colorSwatchActive : ""}`}
                        />
                        <span
                          className={active ? styles.labelActive : styles.labelNormal}
                        >
                          {titleCase(option.value)}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {renderShowMore("color", options.colors)}
              </fieldset>
            )}

            <fieldset className={styles.column}>
              <legend className={styles.columnTitle}>Price</legend>
              {renderCheckboxes("priceGroup", options.priceGroups)}
            </fieldset>

            {options.keywords.length > 0 && (
              <fieldset className={styles.column}>
                <legend className={styles.columnTitle}>Product type</legend>
                {renderCheckboxes("type", options.keywords)}
              </fieldset>
            )}

            {options.brands.length > 0 && (
              <fieldset className={styles.column}>
                <legend className={styles.columnTitle}>Brand</legend>
                {renderCheckboxes("brand", options.brands)}
              </fieldset>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
