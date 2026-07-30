"use client";

import { useState } from "react";
import styles from "./QuantitySelector.module.css";

function QuantitySelector() {
  const [quantity, setQuantity] = useState(1);

  const incrementQty = () => setQuantity((prev) => prev + 1);
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
          aria-label="Increase quantity"
        >
          &#43;
        </button>
      </div>
    </div>
  );
}

export default QuantitySelector;
