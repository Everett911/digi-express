import { CheckoutHeader } from "./CheckoutHeader";
import { OrderSummary } from "./OrderSummary";
import { PaymentSummary } from "./PaymentSummary";
import Footer from "@/src/components/Footer/Footer";
import styles from "./Checkout.module.css";
import { getDeliveryOptions } from "@/lib/db/deliveryoptions";
import { getCartFromSession } from "@/lib/db/cart";
import { getPaymentSummary } from "./paymentSummaryCalculator";
import PurchaseSection from "./PurchaseSection";
import { createPaymentIntentAction } from "@/lib/db/stripe.action";

export default async function CheckoutPage() {
  const deliveryOptions = await getDeliveryOptions();
  const cart = await getCartFromSession();

  const paymentSummary = await getPaymentSummary(cart ?? []);
  const totalQuantity = cart?.reduce((acc, item) => acc + item.quantity, 0);
  const stripe = await createPaymentIntentAction({
    totalCostCents: paymentSummary.totalCostCents,
    cart,
  });
  if (!stripe.success || !stripe.clientSecret) {
    return <div>Error initializing payment wrapper: {stripe.error}</div>;
  }

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
        <div className={styles.paymentSection}>
          <PurchaseSection clientSecret={stripe.clientSecret} />
        </div>
      </main>

      <Footer />
    </>
  );
}
