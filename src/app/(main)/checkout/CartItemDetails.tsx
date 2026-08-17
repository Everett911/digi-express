"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { formatMoney } from "@/src/utils/money";
import dayjs from "dayjs";
import { DeliveryOptions } from "./DeliveryOptions";

import styles from "./CartItemDetails.module.css";
import type { CartItem } from "@/src/schemas/cart";
import type { DeliveryOption } from "@/src/schemas/deliveryOptions";
import { deleteCartItem, updateCartItemQuantity } from "@/lib/db/cart.action";

type Props = {
  cartItem: CartItem;
  deliveryOptions: DeliveryOption[];
  loadCart: () => Promise<void>;
};

export function CartItemDetails({
  cartItem,
  deliveryOptions,
  loadCart,
}: Props) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [quantity, setQuantity] = useState(cartItem.quantity);
  const [isPending, startTransition] = useTransition();

  const handleUpdate = () => {
    if (!isUpdating) {
      setIsUpdating(true);
      return;
    }

    startTransition(async () => {
      try {
        await updateCartItemQuantity(cartItem.productId, quantity);
        await loadCart();
        setIsUpdating(false);
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleUpdate();
    } else if (event.key === "Escape") {
      setQuantity(cartItem.quantity);
      setIsUpdating(false);
    }
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteCartItem(cartItem.productId);
        await loadCart();
      } catch (err) {
        console.error(err);
      }
    });
  };

  const selectedDeliveryOption = deliveryOptions.find(
    (opt) => opt.id === cartItem.deliveryOptionId,
  );

  return (
    <div className={styles.itemContainer} data-testid="cart-item-container">
      <div className={styles.deliveryDate} data-testid="delivery-date">
        Delivery date:{" "}
        {selectedDeliveryOption
          ? dayjs()
              .add(selectedDeliveryOption.deliveryDays, "day")
              .format("dddd, MMMM D")
          : "Select an option"}
      </div>

      <div className={styles.detailsGrid} data-testid="cart-item-details-grid">
        <Image
          className={styles.productImage}
          data-testid="product-image"
          src={cartItem.product.image?.[0] || cartItem.product.image}
          alt={cartItem.product.name}
          width={150}
          height={150}
        />

        <div className={styles.productDetails}>
          <div className={styles.productName} data-testid="product-name">
            {cartItem.product.name}
          </div>
          <div className={styles.productPrice} data-testid="product-price">
            {formatMoney(cartItem.product.priceCents)}
          </div>

          <div
            className={styles.productQuantity}
            data-testid="product-quantity"
          >
            <span className={styles.quantityWrapper}>
              Quantity:{" "}
              <input
                type="number"
                min="1"
                className={`${styles.inputQuantity} ${isUpdating ? styles.visible : ""}`}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                onKeyDown={handleKeyDown}
                disabled={isPending}
              />
              {!isUpdating && (
                <span
                  className={styles.quantityLabel}
                  data-testid="quantity-label"
                >
                  {cartItem.quantity}
                </span>
              )}
            </span>

            <span className={styles.link} onClick={handleUpdate}>
              {isUpdating ? "Save" : "Update"}
            </span>
            <span className={styles.link} onClick={handleDelete}>
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
