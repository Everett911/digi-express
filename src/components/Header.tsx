"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { X, ShoppingCart, Search } from "lucide-react";

import Logo from "@/assets/images/logo.png";
import MobileLogo from "@/assets/images/mobile-logo.png";
import Hamburger from "@/assets/images/icons/hamburger.svg";
import HamburgerClose from "@/assets/images/icons/hamburger-close.svg";

import HeaderTabs from "./HeaderTabs";
import ProfileDropdown from "./ProfileDropdown";
import { type auth } from "../../lib/auth";
import styles from "./Header.module.css";

type Session = typeof auth.$Infer.Session;

export function Header({ session }: { session: Session | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Component States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Safely read URL search parameters only after mounting to avoid hydration mismatches
  /*useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);*/

  const toggleSearchbar = () => setIsSearchOpen((prev) => !prev);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    startTransition(() => {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false); // Closes search bar overlay after redirecting
    });
  };

  const cartLink = session ? "/checkout" : "/auth";

  return (
    <header className={styles.headerContainer}>
      {/* Search Overlay Dropdown */}
      {isSearchOpen && (
        <div className={styles.searchBarContainer}>
          <form
            onSubmit={handleSearchSubmit}
            className={styles.searchBarOverlay}
          >
            <input
              className={styles.searchBar}
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className={styles.searchButton}
              disabled={isPending}
            >
              <Search size={20} color="#ffffff" />
            </button>
            <button
              type="button"
              className={styles.closeButton}
              onClick={toggleSearchbar}
            >
              <X size={20} color="#3467cc" className={styles.closeIcon} />
            </button>
          </form>
        </div>
      )}

      {/* Main Navigation Row */}
      <div className={styles.header}>
        <div className={styles.leftSection}>
          <Link href="/" className={styles.headerLink}>
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

        <div className={styles.middleSection}>
          <HeaderTabs />
          <div className={styles.toggleContainers}>
            <button
              type="button"
              className={styles.toggleMenuButton}
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <HamburgerClose className={styles.iconSvg} />
              ) : (
                <Hamburger className={styles.iconSvg} />
              )}
            </button>
            <button
              type="button"
              className={styles.searchButton}
              onClick={toggleSearchbar}
            >
              <Search size={20} color="#3467cc" className={styles.searchIcon} />
            </button>
          </div>
        </div>

        <div className={styles.rightSection}>
          <button
            type="button"
            className={styles.searchButton}
            onClick={toggleSearchbar}
          >
            <Search size={22} color="#3467cc" />
          </button>

          <Link
            className={`${styles.cartLink} ${styles.headerLink}`}
            href={cartLink}
          >
            <div className={styles.cartQuantity} />
            <ShoppingCart size={22} color="#3467cc" />
          </Link>

          <ProfileDropdown session={session} />
        </div>
      </div>
    </header>
  );
}
