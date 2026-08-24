"use client";

import { useState, useTransition, useEffect, Activity } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { X, ShoppingCart, Search } from "lucide-react";
import Logo from "@/src/assets/images/logo.png";
import MobileLogo from "@/src/assets/images/mobile-logo.png";
import HeaderTabs from "./HeaderTabs";
import ProfileDropdown from "./ProfileDropdown";
import { type auth } from "@/lib/auth";
import styles from "./Header.module.css";

type Session = typeof auth.$Infer.Session;

interface HeaderProps {
  session: Session | null;
  totalQuantity: number;
}

export function Header({ session, totalQuantity }: HeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const currentSearchParam = searchParams.get("search") || "";
  const displayQuery = searchQuery || currentSearchParam;

  useEffect(() => {
    if (!isSearchOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSearchOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  const toggleSearchbar = () => setIsSearchOpen((prev) => !prev);

  const handleSearchSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    const trimmedQuery = displayQuery.trim();
    if (!trimmedQuery) return;

    startTransition(() => {
      router.push(`/products?search=${encodeURIComponent(trimmedQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    });
  };

  const cartLink = session ? "/checkout" : "/auth";

  return (
    <div className={styles.headerContainer} role="banner">
      <Activity mode={isSearchOpen ? "visible" : "hidden"}>
        <div
          className={styles.searchBarContainer}
          role="dialog"
          aria-modal="true"
          aria-label="Product Search"
        >
          <form
            onSubmit={handleSearchSubmit}
            className={styles.searchBarOverlay}
          >
            <input
              className={styles.searchBar}
              type="search"
              placeholder="What are you looking for"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className={styles.searchButton}
              disabled={isPending}
              aria-label="Submit search"
            >
              <Search size={20} color="#ffffff" />
            </button>
            <button
              type="button"
              className={styles.closeButton}
              onClick={toggleSearchbar}
              aria-label="Close search"
            >
              <X size={20} color="#3467cc" className={styles.closeIcon} />
            </button>
          </form>
        </div>
      </Activity>

      <div className={styles.header}>
        <div className={styles.leftSection}>
          <Link href="/" className={styles.headerLink} aria-label="Home">
            <Image
              className={styles.logo}
              src={Logo}
              alt="Company Logo"
              priority
            />
            <Image
              className={styles.mobileLogo}
              src={MobileLogo}
              alt="Company Logo Mobile"
              priority
            />
          </Link>
        </div>

        <nav className={styles.middleSection} aria-label="Main navigation">
          <HeaderTabs />
        </nav>

        <div className={styles.rightSection}>
          <button
            type="button"
            className={styles.searchButton}
            onClick={toggleSearchbar}
            aria-expanded={isSearchOpen}
            aria-label="Open search"
          >
            <Search size={22} color="#3467cc" />
          </button>

          <Link
            className={`${styles.cartLink} ${styles.headerLink}`}
            href={cartLink}
            aria-label="Shopping Cart"
          >
            <div className={styles.cartQuantity}>{totalQuantity}</div>
            <ShoppingCart size={22} color="#3467cc" />
          </Link>

          <ProfileDropdown session={session} />
        </div>
      </div>
    </div>
  );
}
