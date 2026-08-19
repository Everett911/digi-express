import type { Order } from "@/src/schemas/orders";
import { formatCurrency, formatDate } from "@/src/utils/formatters";
import styles from "./OrderPage.module.css";

export function OrderHeader({ order }: { order: Order }) {
  return (
    <div className={styles.orderHeader}>
      <div className={styles.orderHeaderLeftSection}>
        <div className={styles.orderDate}>
          <div className={styles.orderHeaderLabel}>Order Placed:</div>
          <div>{formatDate(order.createdAt)}</div>
        </div>
        <div className={styles.orderTotal}>
          <div className={styles.orderHeaderLabel}>Total:</div>
          <div>{formatCurrency(order.totalCostCents)}</div>
        </div>
      </div>

      <div className={styles.orderHeaderRightSection}>
        <div className={styles.orderHeaderLabel}>Order ID:</div>
        <div>{order.id}</div>
      </div>
    </div>
  );
}
