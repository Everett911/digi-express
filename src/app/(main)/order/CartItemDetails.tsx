import BuyAgainIcon from "../../assets/images/icons/buy-again.png";
import { Fragment } from "react";
import { DeliveryDate } from "./DeliveryDate";
import axios from "axios";
import type { Order, orderProduct } from "../../schemas/orders";

type Props = {
  order: Order;
  loadCart: () => Promise<void>;
};
export function CartItemDetails({ order, loadCart }: Props) {
  return (
    <div className="order-details-grid">
      {order.products.map((p: orderProduct) => {
        const addToCartItem = async () => {
          await axios.post("/api/cart-items", {
            productId: p.product?.id,
            quantity: 1,
          });

          await loadCart();
        };

        return (
          <Fragment key={p.productId}>
            <div className="product-image-container">
              <img src={p.product?.image} />
            </div>

            <div className="product-details">
              <div className="product-name">{p.product?.name}</div>

              <DeliveryDate
                productId={p.product?.id || ""}
                quantity={p.quantity}
                estimatedDeliveryTimeMs={p.estimatedDeliveryTimeMs}
              />

              <div className="product-quantity">Quantity: {p.quantity}</div>
              <button className="buy-again-button button-primary">
                <img className="buy-again-icon" src={BuyAgainIcon} />
                <span className="buy-again-message" onClick={addToCartItem}>
                  Add to Cart
                </span>
              </button>
            </div>

            <div className="product-actions">
              <a href={`/tracking/${order.id}/${p.product?.id}`}>
                <button className="track-package-button button-secondary">
                  Track package
                </button>
              </a>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
