import axios from "axios";
import { useState, useEffect } from "react";
import { CheckoutHeader } from "./CheckoutHeader";
import "./CheckoutPage.css";
import { PaymentSummary } from "./PaymentSummary";
import { OrderSummary } from "./OrderSummary";
import type { CartItem } from "../../schemas/cart";
import {
  deliveryOptionSchema,
  type Delivery,
} from "../../schemas/deliveryOptions";
import Footer from "../../components/Footer";

type Props = {
  cart: CartItem[];
  totalQuantity: number;
  loadCart: () => Promise<void>;
};
export function CheckoutPage({ cart, totalQuantity, loadCart }: Props) {
  const [deliveryOptions, setDeliveryOptions] = useState<Delivery[]>([]);
  const [paymentSummary, setPaymentSummary] = useState(null);

  useEffect(() => {
    const fetchCheckoutData = async () => {
      const response = await axios.get(
        "/api/delivery-options?expand=estimatedDeliveryTime",
      );
      const data = deliveryOptionSchema.array().parse(response.data);
      setDeliveryOptions(data);
    };

    fetchCheckoutData();
  }, []);

  useEffect(() => {
    const fetchCheckoutData = async () => {
      const response = await axios.get("/api/payment-summary");
      setPaymentSummary(response.data);
    };

    fetchCheckoutData();
  }, [cart]);

  return (
    <>
      <title>Checkout</title>
      <link rel="icon" type="image/svg+xml" href="/cart-favicon.png" />

      <CheckoutHeader totalQuantity={totalQuantity} />

      <div className="checkout-page">
        <div className="page-title">Review your order</div>

        <div className="checkout-grid">
          <OrderSummary
            cart={cart}
            deliveryOptions={deliveryOptions}
            loadCart={loadCart}
          />

          <PaymentSummary paymentSummary={paymentSummary} loadCart={loadCart} />
        </div>
      </div>
      <Footer />
    </>
  );
}
