"use client";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Receipt, Users } from "lucide-react";
import styles from "./AdminNav.module.css";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Sales", icon: Receipt },
  { href: "/admin/users", label: "Customers", icon: Users },
] as const;

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Admin">
      {LINKS.map(({ href, label, icon: Icon }) => {
        // Dashboard only matches exactly; sections also match their sub-pages.
        const isActive =
          href === "/admin" ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href as Route}
            className={isActive ? `${styles.link} ${styles.active}` : styles.link}
            aria-current={isActive ? "page" : undefined}
            aria-label={label}
          >
            <Icon size={18} aria-hidden />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
