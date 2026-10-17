"use client";
import Image from "next/image";
import type { Prisma } from "@prisma/client";
import { formatCurrency } from "@/src/utils/formatters";
import type { DeliveryOption } from "@/src/schemas/deliveryOptions";
import styles from "./OrderSummary.module.css";
import {
  deleteCartItem,
  updateCartItemQuantity,
  updateDeliveryOption,
  type CartActionResult,
} from "@/lib/db/cart.action";
import QuantitySelector from "@/src/components/QuantitySelector/QuantitySelector";
import { useState, useTransition } from "react";

type CartLine = Prisma.CartItemGetPayload<{
  include: { product: true; deliveryOption: true };
}>;

type Props = {
  carts: CartLine[] | undefined;
  deliveryOptions: DeliveryOption[];
};

export function OrderSummary({ carts, deliveryOptions }: Props) {
  if (!carts) return null;

  return (
    <div className={styles.cartItemContainer}>
      {carts.map((cart) => (
        <CartItemRow key={cart.id} cart={cart} deliveryOptions={deliveryOptions} />
      ))}
    </div>
  );
}

function CartItemRow({
  cart,
  deliveryOptions,
}: {
  cart: CartLine;
  deliveryOptions: DeliveryOption[];
}) {
  const [quantity, setQuantity] = useState<number>(cart.quantity);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const run = (action: () => Promise<CartActionResult>) => {
    setError("");
    startTransition(async () => {
      const result = await action();
      if (!result.success) setError(result.error);
    });
  };

  return (
    <div className={`${styles.deliveryGrid} ${isPending ? styles.loadingDim : ""}`}>
      <div className={styles.productInfo}>
        <div className={styles.imageWrapper}>
          <Image
            src={cart.product.image[0]}
            alt={cart.product.name}
            fill
            sizes="(max-width: 150px) 100vw, (max-width: 150px) 50vw, 33vw"
            className={styles.productImage}
          />
        </div>
        <div className={styles.productDetails}>
          <h4 className={styles.productName}>{cart.product.name}</h4>
          <p className={styles.productPrice}>{formatCurrency(cart.product.priceCents / 100)}</p>
          {cart.color && <p className={styles.productSize}>Color - {cart.color}</p>}
          {cart.size && <p className={styles.productColor}>Size - {cart.size.toUpperCase()}</p>}
          <div className={styles.quantityUpdate}>
            <QuantitySelector quantity={quantity} setQuantity={setQuantity} />
            <button
              type="button"
              className={styles.updateLink}
              disabled={isPending}
              onClick={() => run(() => updateCartItemQuantity(cart.id, quantity))}
            >
              Update
            </button>
            <button
              type="button"
              className={styles.deleteLink}
              disabled={isPending}
              onClick={() => run(() => deleteCartItem(cart.id))}
            >
              Delete
            </button>
          </div>
          {error && (
            <p className={styles.actionError} role="alert">
              {error}
            </p>
          )}
        </div>
      </div>

      <div className={styles.deliveryOptions}>
        <p className={styles.deliveryHeader}>Choose a delivery option:</p>
        {deliveryOptions.map((option) => (
          <div key={option.id} className={styles.optionRow}>
            <input
              type="radio"
              name={`delivery-${cart.id}`}
              disabled={isPending}
              checked={cart.deliveryOptionId === option.id}
              className={styles.radioInput}
              onChange={() => run(() => updateDeliveryOption(cart.id, option.id))}
            />
            <div className={styles.optionLabel}>
              <span className={styles.deliveryDate}>Arrives in {option.deliveryDays} days</span>
              <span className={styles.deliveryCost}>
                {option.priceCents === 0
                  ? "FREE Shipping"
                  : formatCurrency(option.priceCents / 100)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
