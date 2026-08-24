"use client";
import { Activity, useState, useTransition } from "react";
import styles from "./detail.module.css";
import ColorButton from "@/src/components/Button/ColorButton";
import SizeButton from "@/src/components/Button/SizeButton";
import { Product } from "@/.prisma/client/client";
import { formatCurrency } from "@/src/utils/formatters";
import QuantitySelector from "@/src/components/QuantitySelector/QuantitySelector";
import { addItemToCart } from "@/lib/db/cart.action";

export default function ProductDetailContent({
  product,
}: {
  product: Product;
}) {
  const [selectedColor, setSelectedColor] = useState<string | null>("");
  const [selectedSize, setSelectedSize] = useState<string | null>("");
  const [quantity, setQuantity] = useState<number>(1); //
  const [isPending, startTransition] = useTransition();

  const handleAddToCart = () => {
    if (product.size.length > 0 && !selectedSize) {
      return;
    }
    if (product.color.length > 0 && !selectedColor) {
      return;
    }

    startTransition(async () => {
      try {
        await addItemToCart({
          productId: product.id,
          quantity: quantity,
          size: selectedSize,
          color: selectedColor,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        alert(message || "Something went wrong.");
      }
    });
  };

  return (
    <div className={styles.details}>
      <h1 className={styles.title}>{product.name}</h1>
      <span className={styles.price}>
        {formatCurrency(product.priceCents / 100)}
      </span>

      <Activity mode={product.size.length === 0 ? "hidden" : "visible"}>
        <span className={styles.sizeTitle}>Size</span>
        <div className={styles.sizeContainer}>
          {product.size.map((siz) => (
            <SizeButton
              key={siz}
              isActive={selectedSize === siz}
              onClick={() => setSelectedSize(siz)}
            >
              {siz.toUpperCase()}
            </SizeButton>
          ))}
        </div>
      </Activity>
      {!selectedSize && (
        <span className={styles.errorText}>Please select a size</span>
      )}

      <Activity mode={product.color.length === 0 ? "hidden" : "visible"}>
        <span className={styles.sizeTitle}>Color</span>
        <div className={styles.sizeContainer}>
          {product.color.map((col) => (
            <ColorButton
              key={col}
              col={col}
              isActive={selectedColor === col}
              onClick={() => setSelectedColor(col)}
            />
          ))}
        </div>
      </Activity>
      {!selectedColor && (
        <span className={styles.errorText}>Please select a color</span>
      )}

      <div className={styles.buttonWrapper}>
        <QuantitySelector quantity={quantity} setQuantity={setQuantity} />

        <button
          className={styles.actionButton}
          onClick={handleAddToCart}
          disabled={isPending}
        >
          {isPending ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
