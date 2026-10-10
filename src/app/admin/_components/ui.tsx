import type { ReactNode } from "react";
import type { Route } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import styles from "./ui.module.css";

// Building blocks shared by every admin page.

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className={styles.pageHeader}>
      <div>
        <h1 className={styles.pageTitle}>{title}</h1>
        {description && (
          <p className={styles.pageDescription}>{description}</p>
        )}
      </div>
      {action}
    </header>
  );
}

export function ButtonLink({
  href,
  icon: Icon,
  children,
}: {
  href: Route;
  icon?: LucideIcon;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={styles.buttonLink}>
      {Icon && <Icon size={16} aria-hidden />}
      {children}
    </Link>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
}) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statTop}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statIcon} aria-hidden>
          <Icon size={18} />
        </span>
      </div>
      <span className={styles.statValue}>{value}</span>
      {hint && <span className={styles.statHint}>{hint}</span>}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={styles.panel}>
      {(title || action) && (
        <div className={styles.panelHeader}>
          {title && <h2 className={styles.panelTitle}>{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function TextLink({ href, children }: { href: Route; children: ReactNode }) {
  return (
    <Link href={href} className={styles.textLink}>
      {children}
    </Link>
  );
}

type BadgeTone = "success" | "neutral" | "accent";

export function StatusBadge({
  tone,
  children,
}: {
  tone: BadgeTone;
  children: ReactNode;
}) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>{title}</p>
      {description && <p className={styles.emptyDescription}>{description}</p>}
    </div>
  );
}

export function Pagination({
  basePath,
  page,
  totalPages,
}: {
  basePath: string;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (target: number) => `${basePath}?page=${target}` as Route;

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={styles.pageButton}>
          <ChevronLeft size={16} aria-hidden /> Previous
        </Link>
      ) : (
        <span className={`${styles.pageButton} ${styles.pageButtonDisabled}`}>
          <ChevronLeft size={16} aria-hidden /> Previous
        </span>
      )}
      <span className={styles.pageInfo}>
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={styles.pageButton}>
          Next <ChevronRight size={16} aria-hidden />
        </Link>
      ) : (
        <span className={`${styles.pageButton} ${styles.pageButtonDisabled}`}>
          Next <ChevronRight size={16} aria-hidden />
        </span>
      )}
    </nav>
  );
}

export function TableSkeleton({
  label = "Loading",
  rows = 6,
}: {
  label?: string;
  rows?: number;
}) {
  return (
    <div className={styles.skeleton} role="status" aria-label={label}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className={styles.skeletonRow} />
      ))}
    </div>
  );
}

// Visually hidden text for screen readers (e.g. icon-only table headers).
export function SrOnly({ children }: { children: ReactNode }) {
  return <span className={styles.srOnly}>{children}</span>;
}
