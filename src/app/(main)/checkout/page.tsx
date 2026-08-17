import { CheckoutHeader } from "./CheckoutHeader";
import { OrderSummary } from "./OrderSummary";
import { PaymentSummary } from "./PaymentSummary";
import Footer from "@/src/components/Footer/Footer";
import styles from "./Checkout.module.css";
import { getDeliveryOptions } from "@/lib/db/deliveryoptions";
import { getCartFromSession } from "@/lib/db/cart";
import { getPaymentSummary } from "./paymentSummaryCalculator";

export default async function CheckoutPage() {
  const deliveryOptions = await getDeliveryOptions();
  const cart = await getCartFromSession();

  const paymentSummary = await getPaymentSummary(cart ?? []);
  const totalQuantity = cart?.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <CheckoutHeader totalQuantity={totalQuantity ?? 0} />

      <main className={styles.checkoutPage}>
        <h1 className={styles.pageTitle}>Review your order</h1>

        <div className={styles.checkoutGrid}>
          <section className={styles.orderSection}>
            <OrderSummary
              carts={cart ?? []}
              deliveryOptions={deliveryOptions}
            />
          </section>

          <aside className={styles.summarySection}>
            <PaymentSummary paymentSummary={paymentSummary} />
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}
