"use client";

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
          {formatCurrency(paymentSummary.productCostCents / 100)}
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
            : formatCurrency(paymentSummary.shippingCostCents / 100)}
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={`${styles.row} ${styles.subtotalRow}`}>
        <div>Total before tax:</div>
        <div
          className={styles.money}
          data-testid="payment-summary-money-total-before-tax"
        >
          {formatCurrency(paymentSummary.totalCostBeforeTaxCents / 100)}
        </div>
      </div>

      <div className={styles.row}>
        <div>Estimated tax (10%):</div>
        <div
          className={styles.money}
          data-testid="payment-summary-money-estimated-tax"
        >
          {formatCurrency(paymentSummary.taxCents / 100)}
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={`${styles.row} ${styles.totalRow}`}>
        <div>Order total:</div>
        <div
          className={styles.money}
          data-testid="payment-summary-money-order-total"
        >
          {formatCurrency(paymentSummary.totalCostCents / 100)}
        </div>
      </div>
    </div>
  );
}
