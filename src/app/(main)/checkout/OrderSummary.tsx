import "./OrderSummary.css";
import { CartItemDetails } from "./CartItemDetails";
import type { CartItem } from "../../schemas/cart";
import type { Delivery } from "../../schemas/deliveryOptions";

type Props = {
  cart: CartItem[];
  deliveryOptions: Delivery[];
  loadCart: () => Promise<void>;
};
export function OrderSummary({ cart, deliveryOptions, loadCart }: Props) {
  return (
    <div className="order-summary">
      {deliveryOptions.length > 0 &&
        cart.map((cartItem) => {
          return (
            <CartItemDetails
              key={cartItem.productId}
              cartItem={cartItem}
              deliveryOptions={deliveryOptions}
              loadCart={loadCart}
            />
          );
        })}
    </div>
  );
}
