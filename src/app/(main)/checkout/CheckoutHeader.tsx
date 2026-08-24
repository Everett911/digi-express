"use client";

import Link from "next/link";
import { ChevronLeft, Lock } from "lucide-react";
import styles from "./CheckoutHeader.module.css";

export function CheckoutHeader({ totalQuantity }: { totalQuantity: number }) {
  return (
    <header className={styles.checkoutHeader}>
      <div className={styles.headerContent}>
        <div className={styles.checkoutHeaderLeftSection}>
          <Link href="/">
            <ChevronLeft className={styles.icon} />
          </Link>
        </div>

        <div className={styles.checkoutHeaderMiddleSection}>
          Checkout (
          <Link className={styles.returnToHomeLink} href="/">
            {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
          </Link>
          )
        </div>

        <div className={styles.checkoutHeaderRightSection}>
          <Lock className={styles.icon} />
        </div>
      </div>
    </header>
  );
}
