"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import styles from "./HeaderSearch.module.css";

interface HeaderSearchProps {
  initialQuery: string;
}

// Search box shown in the middle of the header on product pages.
export default function HeaderSearch({ initialQuery }: HeaderSearchProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();

    // Searching for nothing clears the search and shows every product.
    startTransition(() => {
      router.push(
        trimmedQuery
          ? `/products?search=${encodeURIComponent(trimmedQuery)}`
          : "/products",
      );
    });
  };

  return (
    <form role="search" onSubmit={handleSubmit} className={styles.form}>
      <input
        className={styles.input}
        type="search"
        placeholder="Search products"
        aria-label="Search products"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        type="submit"
        className={styles.button}
        disabled={isPending}
        aria-label="Submit search"
      >
        <Search size={18} style={{ color: "var(--text-on-dark)" }} />
      </button>
    </form>
  );
}
