import { OrderGrid } from "./OrderGrid";
import styles from "./OrderPage.module.css";

import Footer from "@/src/components/Footer/Footer";
import { Order } from "@/src/schemas/orders";

type Props = {
  orders: Order[];
};
export function OrderList({ orders }: Props) {
  return (
    <>
      <title>Orders</title>
      <link rel="icon" type="image/svg+xml" href="/orders-favicon.png" />

      <div className={styles.ordersPage}>
        <div className={styles.pageTitle}>Your Orders</div>

        <OrderGrid orders={orders} />
      </div>
      <Footer />
    </>
  );
}
