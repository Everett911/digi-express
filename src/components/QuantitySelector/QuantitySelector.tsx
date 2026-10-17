"use client";

import { Dispatch, SetStateAction } from "react";
import styles from "./QuantitySelector.module.css";
import { MAX_CART_QUANTITY } from "@/src/schemas/cart";

function QuantitySelector({
  quantity,
  setQuantity,
  max = MAX_CART_QUANTITY,
}: {
  quantity: number;
  setQuantity: Dispatch<SetStateAction<number>>;
  max?: number;
}) {
  const incrementQty = () => setQuantity((prev) => (prev < max ? prev + 1 : max));
  const decrementQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div className={styles.container}>
      <div className={styles.quantitySelector}>
        <button
          type="button"
          className={styles.qtyBtn}
          onClick={decrementQty}
          disabled={quantity <= 1}
          aria-label="Decrease quantity"
        >
          &minus;
        </button>
        <span className={styles.qtyDisplay} aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          className={styles.qtyBtn}
          onClick={incrementQty}
          disabled={quantity >= max}
          aria-label="Increase quantity"
        >
          &#43;
        </button>
      </div>
    </div>
  );
}

export default QuantitySelector;
