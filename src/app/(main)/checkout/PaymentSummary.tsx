"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { createOrderFromCart } from "@/lib/db/cart.action";
import styles from "./PaymentSummary.module.css";
import { formatCurrency } from "@/src/utils/formatters";

type PaymentSummaryType = {
  totalItems: number;
  productCostCents: number;
  shippingCostCents: number;
  totalCostBeforeTaxCents: number;
  taxCents: number;
  totalCostCents: number;
};

type Props = {
  paymentSummary: PaymentSummaryType | null;
};

export function PaymentSummary({ paymentSummary }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handlePlaceOrder = () => {
    startTransition(async () => {
      const result = await createOrderFromCart();

      if (result.success) {
        router.push("/");
      } else {
        alert("Order placement failed.");
      }
    });
  };

  if (!paymentSummary) {
    return <div className={styles.paymentSummary}>Loading totals...</div>;
  }

  return (
    <div className={styles.paymentSummary}>
      <h2 className={styles.title}>Order Summary</h2>

      <div className={styles.row} data-testid="payment-summary-product-cost">
        <div>Items ({paymentSummary.totalItems}):</div>
        <div
          className={styles.money}
          data-testid="payment-summary-money-without-tax-and-delivery"
        >
          {formatCurrency(paymentSummary.productCostCents)}
        </div>
      </div>

      <div className={styles.row}>
        <div>Shipping &amp; handling:</div>
        <div
          className={styles.money}
          data-testid="payment-summary-money-delivery"
        >
          {paymentSummary.shippingCostCents === 0
            ? "FREE"
            : formatCurrency(paymentSummary.shippingCostCents)}
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={`${styles.row} ${styles.subtotalRow}`}>
        <div>Total before tax:</div>
        <div
          className={styles.money}
          data-testid="payment-summary-money-total-before-tax"
        >
          {formatCurrency(paymentSummary.totalCostBeforeTaxCents)}
        </div>
      </div>

      <div className={styles.row}>
        <div>Estimated tax (10%):</div>
        <div
          className={styles.money}
          data-testid="payment-summary-money-estimated-tax"
        >
          {formatCurrency(paymentSummary.taxCents)}
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={`${styles.row} ${styles.totalRow}`}>
        <div>Order total:</div>
        <div
          className={styles.money}
          data-testid="payment-summary-money-order-total"
        >
          {formatCurrency(paymentSummary.totalCostCents)}
        </div>
      </div>

      <button
        className={styles.placeOrderButton}
        data-testid="place-order-button"
        onClick={handlePlaceOrder}
        disabled={isPending || paymentSummary.totalItems === 0}
      >
        {isPending ? "Processing..." : "Place your order"}
      </button>
    </div>
  );
}
