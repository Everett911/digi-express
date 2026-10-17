"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { CircleCheck, CircleAlert, Truck } from "lucide-react";
import styles from "./detail.module.css";
import ColorButton from "@/src/components/Button/ColorButton";
import SizeButton from "@/src/components/Button/SizeButton";

import { formatCurrency } from "@/src/utils/formatters";
import QuantitySelector from "@/src/components/QuantitySelector/QuantitySelector";
import { addItemToCart } from "@/lib/db/cart.action";
import { Product } from "@prisma/client";

export type DeliveryEstimate = {
  id: string;
  priceCents: number;
  deliveryDays: number;
  arrival: string;
};

function deliveryName(days: number) {
  if (days <= 1) return "Next-day delivery";
  if (days <= 3) return `Express delivery, ${days} days`;
  return `Standard delivery, ${days} days`;
}

type CartStatus =
  | { kind: "idle" }
  | { kind: "added"; quantity: number }
  | { kind: "signedOut" }
  | { kind: "error"; message: string };

export default function ProductDetailContent({
  product,
  sizes,
  colors,
  deliveryEstimates,
}: {
  product: Product;
  sizes: string[];
  colors: string[];
  deliveryEstimates: DeliveryEstimate[];
}) {
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState<string | null>("");
  const [selectedSize, setSelectedSize] = useState<string | null>("");
  const [quantity, setQuantity] = useState<number>(1); //
  // Only show "select a size/color" after the customer tries to add.
  const [triedToAdd, setTriedToAdd] = useState(false);
  const [status, setStatus] = useState<CartStatus>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();

  const isAvailable = product.isAvailableForPurchase;
  const needsSize = sizes.length > 0 && !selectedSize;
  const needsColor = colors.length > 0 && !selectedColor;

  const handleAddToCart = () => {
    setTriedToAdd(true);
    setStatus({ kind: "idle" });
    if (!isAvailable || needsSize || needsColor) return;

    startTransition(async () => {
      try {
        const result = await addItemToCart({
          productId: product.id,
          quantity: quantity,
          size: selectedSize,
          color: selectedColor,
        });
        if (!result.success) {
          setStatus(
            result.signedOut ? { kind: "signedOut" } : { kind: "error", message: result.error },
          );
          return;
        }
        setStatus({ kind: "added", quantity });
        // Refresh the header so the cart count updates.
        router.refresh();
      } catch {
        setStatus({
          kind: "error",
          message: "Couldn't add this item to your cart.",
        });
      }
    });
  };

  return (
    <div className={styles.details}>
      <Link
        className={styles.brand}
        href={`/products?brand=${encodeURIComponent(product.brand)}` as Route}
      >
        {product.brand}
      </Link>
      <h1 className={styles.title}>{product.name}</h1>
      <span className={styles.price}>{formatCurrency(product.priceCents / 100)}</span>

      {isAvailable ? (
        <p className={styles.inStock}>
          <CircleCheck size={18} aria-hidden="true" /> In stock
        </p>
      ) : (
        <p className={styles.outOfStock}>
          <CircleAlert size={18} aria-hidden="true" /> Currently unavailable
        </p>
      )}

      {sizes.length > 0 && (
        <div className={styles.optionGroup}>
          <span className={styles.sizeTitle}>
            Size
            {selectedSize && (
              <strong className={styles.selectedValue}>: {selectedSize.toUpperCase()}</strong>
            )}
          </span>
          <div className={styles.sizeContainer}>
            {sizes.map((siz) => (
              <SizeButton
                key={siz}
                isActive={selectedSize === siz}
                onClick={() => setSelectedSize(siz)}
              >
                {siz.toUpperCase()}
              </SizeButton>
            ))}
          </div>

          {triedToAdd && needsSize && (
            <span className={styles.errorText} role="alert">
              Choose a size to add this item to your cart.
            </span>
          )}
        </div>
      )}

      {colors.length > 0 && (
        <div className={styles.optionGroup}>
          <span className={styles.sizeTitle}>
            Color
            {selectedColor && (
              <strong className={styles.selectedValue}>
                : {selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1)}
              </strong>
            )}
          </span>
          <div className={styles.sizeContainer}>
            {colors.map((col) => (
              <ColorButton
                key={col}
                col={col}
                isActive={selectedColor === col}
                onClick={() => setSelectedColor(col)}
              />
            ))}
          </div>

          {triedToAdd && needsColor && (
            <span className={styles.errorText} role="alert">
              Choose a color to add this item to your cart.
            </span>
          )}
        </div>
      )}

      <div className={styles.buttonWrapper}>
        <QuantitySelector quantity={quantity} setQuantity={setQuantity} />

        <button
          className={styles.actionButton}
          onClick={handleAddToCart}
          disabled={isPending || !isAvailable}
        >
          {isPending ? "Adding..." : "Add to Cart"}
        </button>
      </div>

      <div aria-live="polite">
        {status.kind === "added" && (
          <p className={styles.cartMessage}>
            Added {status.quantity} to your cart.{" "}
            <Link href="/checkout" className={styles.specLink}>
              View cart
            </Link>
          </p>
        )}
        {status.kind === "signedOut" && (
          <p className={styles.errorText}>
            <Link href="/auth" className={styles.specLink}>
              Sign in
            </Link>{" "}
            to add items to your cart.
          </p>
        )}
        {status.kind === "error" && <p className={styles.errorText}>{status.message}</p>}
      </div>

      {deliveryEstimates.length > 0 && (
        <div className={styles.delivery}>
          <p className={styles.deliveryTitle}>
            <Truck size={18} aria-hidden="true" /> Delivery
          </p>
          <ul className={styles.deliveryList}>
            {deliveryEstimates.map((estimate) => (
              <li key={estimate.id} className={styles.deliveryOption}>
                <span className={styles.deliveryWhen}>
                  <span className={styles.deliveryDate}>Arrives {estimate.arrival}</span>
                  <span className={styles.deliveryName}>{deliveryName(estimate.deliveryDays)}</span>
                </span>
                <span
                  className={
                    estimate.priceCents === 0
                      ? `${styles.deliveryPrice} ${styles.deliveryFree}`
                      : styles.deliveryPrice
                  }
                >
                  {estimate.priceCents === 0 ? "Free" : formatCurrency(estimate.priceCents / 100)}
                </span>
              </li>
            ))}
          </ul>
          <p className={styles.deliveryNote}>You can choose your delivery option at checkout.</p>
        </div>
      )}
    </div>
  );
}
