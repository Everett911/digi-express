"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { X, ShoppingCart, Search } from "lucide-react";
import Logo from "@/src/assets/images/logo.png";
import MobileLogo from "@/src/assets/images/mobile-logo.png";
import HeaderTabs from "./HeaderTabs";
import HeaderSearch from "./HeaderSearch";
import ProfileDropdown from "./ProfileDropdown";

import styles from "./Header.module.css";
import { authClient } from "@/lib/auth-client";

type Session = typeof authClient.$Infer.Session;

interface HeaderProps {
  session: Session | null;
  totalQuantity: number;
}

export function Header({ session, totalQuantity }: HeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  // Product pages swap the department tabs for an always-visible search box.
  const isProductPage = pathname.startsWith("/products");
  const [isPending, startTransition] = useTransition();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const currentSearchParam = searchParams.get("search") || "";
  const displayQuery = searchQuery || currentSearchParam;

  const searchDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = searchDialogRef.current;
    if (!dialog) return;
    if (isSearchOpen && !dialog.open) dialog.showModal();
    if (!isSearchOpen && dialog.open) dialog.close();
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
    <header className={styles.headerContainer}>
      <dialog
        ref={searchDialogRef}
        className={styles.searchBarContainer}
        aria-label="Product Search"
        // Escape closes the dialog natively; keep the state in step.
        onClose={() => setIsSearchOpen(false)}
      >
        <form onSubmit={handleSearchSubmit} className={styles.searchBarOverlay}>
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
            <Search size={20} style={{ color: "var(--text-on-dark)" }} />
          </button>
          <button
            type="button"
            className={styles.closeButton}
            onClick={toggleSearchbar}
            aria-label="Close search"
          >
            <X size={20} style={{ color: "var(--brand)" }} className={styles.closeIcon} />
          </button>
        </form>
      </dialog>

      <div className={`${styles.header} ${isProductPage ? styles.headerWithSearch : ""}`}>
        <div className={styles.leftSection}>
          <Link href="/" className={styles.headerLink} aria-label="Home">
            <Image className={styles.logo} src={Logo} alt="Company Logo" priority />
            <Image
              className={styles.mobileLogo}
              src={MobileLogo}
              alt="Company Logo Mobile"
              priority
            />
          </Link>
        </div>

        {isProductPage ? (
          <div className={styles.middleSearch}>
            {/* key resets the box when the search changes from elsewhere */}
            <HeaderSearch key={currentSearchParam} initialQuery={currentSearchParam} />
          </div>
        ) : (
          <nav className={styles.middleSection} aria-label="Main navigation">
            <HeaderTabs />
          </nav>
        )}

        <div className={styles.rightSection}>
          {!isProductPage && (
            <button
              type="button"
              className={styles.searchButton}
              onClick={toggleSearchbar}
              aria-expanded={isSearchOpen}
              aria-label="Open search"
            >
              <Search size={22} style={{ color: "var(--brand)" }} />
            </button>
          )}

          <Link
            className={`${styles.cartLink} ${styles.headerLink}`}
            href={cartLink}
            aria-label="Shopping Cart"
          >
            <div className={styles.cartQuantity}>{totalQuantity}</div>
            <ShoppingCart size={22} style={{ color: "var(--brand)" }} />
          </Link>

          <ProfileDropdown session={session} />
        </div>
      </div>
    </header>
  );
}
