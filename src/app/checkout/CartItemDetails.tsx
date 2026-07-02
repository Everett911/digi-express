import { formatMoney } from "../../utils/money";
import axios from "axios";
import dayjs from "dayjs";
import { DeliveryOptions } from "./DeliveryOptions";
import { useState } from "react";
import type { CartItem } from "../../schemas/cart";
import type { Delivery } from "../../schemas/deliveryOptions";

type Props = {
  cartItem: CartItem;
  deliveryOptions: Delivery[];
  loadCart: () => Promise<void>;
};

export function CartItemDetails({
  cartItem,
  deliveryOptions,
  loadCart,
}: Props) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [quantity, setQuantity] = useState(cartItem.quantity);

  const updateQuantity = async () => {
    if (!isUpdating) {
      setIsUpdating(true);
    }

    if (isUpdating) {
      await axios.put(`/api/cart-items/${cartItem.productId}`, {
        quantity,
      });
      setIsUpdating(false);
    }

    loadCart();
  };

  const InputValueQuantity = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(Number(event.target.value));
  };

  const keyEvent = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const keyPress = event.key;

    if (keyPress === "Enter") {
      updateQuantity();
    } else if (keyPress === "Escape") {
      setQuantity(cartItem.quantity);
      setIsUpdating(false);
    }
  };

  const selectedDeliveryOption = deliveryOptions.find((deliveryOption) => {
    return deliveryOption.id === cartItem.deliveryOptionId;
  });

  const deleteCartItem = async () => {
    await axios.delete(`/api/cart-items/${cartItem.productId}`);

    await loadCart();
  };
  return (
    <div
      key={cartItem.productId}
      className="cart-item-container"
      data-testid="cart-item-container"
    >
      <div className="delivery-date" data-testid="delivery-date">
        Delivery date:{" "}
        {dayjs(selectedDeliveryOption?.estimatedDeliveryTimeMs ?? 0).format(
          "dddd, MMMM D",
        )}
      </div>

      <div
        className="cart-item-details-grid"
        data-testid="cart-item-details-grid"
      >
        <img
          className="product-image"
          data-testid="product-image"
          src={cartItem.product.image}
        />

        <div className="cart-item-details">
          <div className="product-name" data-testid="product-name">
            {cartItem.product.name}
          </div>
          <div className="product-price" data-testid="product-price">
            {formatMoney(cartItem.product.priceCents)}
          </div>
          <div className="product-quantity" data-testid="product-quantity">
            <span>
              Quantity:{" "}
              <input
                type="text"
                className="input-quantity"
                style={{ opacity: isUpdating ? 1 : 0 }}
                value={quantity}
                onChange={InputValueQuantity}
                onKeyDown={keyEvent}
              />
              <span className="quantity-label" data-testid="quantity-label">
                {cartItem.quantity}
              </span>
            </span>
            <span
              className="update-quantity-link link-primary"
              onClick={updateQuantity}
            >
              Update
            </span>
            <span
              className="delete-quantity-link link-primary"
              onClick={deleteCartItem}
            >
              Delete
            </span>
          </div>
        </div>

        <DeliveryOptions
          cartItem={cartItem}
          deliveryOptions={deliveryOptions}
          loadCart={loadCart}
        />
      </div>
    </div>
  );
}
