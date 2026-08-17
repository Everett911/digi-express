"use client";
import Image from "next/image";
import { formatCurrency } from "@/src/utils/formatters";
import type { DeliveryOption } from "@/src/schemas/deliveryOptions";
import styles from "./OrderSummary.module.css";
import {
  deleteCartItem,
  updateCartItemQuantity,
  updateDeliveryOption,
} from "@/lib/db/cart.action";
import QuantitySelector from "@/src/components/QuantitySelector/QuantitySelector";
import { useState, useTransition } from "react";

// 1. Defined a precise type for a single cart item from your array

type Props = {
  carts:
    | ({
        product: {
          name: string;
          id: string;
          color: string[];
          size: string[];
          createdAt: Date;
          updatedAt: Date;
          priceCents: number;
          image: string[];
          description: string | null;
          brand: string;
          keywords: string[];
          isAvailableForPurchase: boolean;
        };
        deliveryOption: {
          id: string;
          createdAt: Date;
          updatedAt: Date;
          deliveryDays: number;
          priceCents: number;
        };
      } & {
        id: string;
        userId: string;
        productId: string;
        quantity: number;
        color: string | null;
        size: string | null;
        deliveryOptionId: string;
        createdAt: Date;
        updatedAt: Date;
      })[]
    | undefined;
  deliveryOptions: DeliveryOption[];
};

export function OrderSummary({ carts, deliveryOptions }: Props) {
  if (!carts) return null;

  return (
    <div className={styles.cartItemContainer}>
      {carts.map((cart) => (
        <CartItemRow
          key={cart.id}
          cart={cart}
          deliveryOptions={deliveryOptions}
        />
      ))}
    </div>
  );
}

function CartItemRow({
  cart,
  deliveryOptions,
}: {
  cart: {
    product: {
      name: string;
      id: string;
      color: string[];
      size: string[];
      createdAt: Date;
      updatedAt: Date;
      priceCents: number;
      image: string[];
      description: string | null;
      brand: string;
      keywords: string[];
      isAvailableForPurchase: boolean;
    };
    deliveryOption: {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      deliveryDays: number;
      priceCents: number;
    };
  } & {
    id: string;
    userId: string;
    productId: string;
    quantity: number;
    color: string | null;
    size: string | null;
    deliveryOptionId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  deliveryOptions: DeliveryOption[];
}) {
  const [quantity, setQuantity] = useState<number>(cart.quantity);
  const [isPending, startTransition] = useTransition();

  return (
    <div
      className={`${styles.deliveryGrid} ${isPending ? styles.loadingDim : ""}`}
    >
      <div className={styles.productInfo}>
        <div className={styles.imageWrapper}>
          <Image
            src={cart.product.image[0]}
            alt={cart.product.name}
            fill
            className={styles.productImage}
          />
        </div>
        <div className={styles.productDetails}>
          <h4 className={styles.productName}>{cart.product.name}</h4>
          <p className={styles.productPrice}>
            {formatCurrency(cart.product.priceCents)}
          </p>
          {cart.color && (
            <p className={styles.productSize}>Color - {cart.color}</p>
          )}
          {cart.size && (
            <p className={styles.productColor}>Size - {cart.size}</p>
          )}
          <div className={styles.quantityUpdate}>
            <QuantitySelector quantity={quantity} setQuantity={setQuantity} />
            <button
              type="button"
              className={styles.updateLink}
              disabled={isPending}
              onClick={() => {
                startTransition(() => {
                  updateCartItemQuantity(cart.product.id, quantity);
                });
              }}
            >
              Update
            </button>
            <button
              type="button"
              className={styles.deleteLink}
              disabled={isPending}
              onClick={() => {
                startTransition(() => {
                  deleteCartItem(cart.product.id);
                });
              }}
            >
              Delete
            </button>
          </div>
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
              onChange={() => {
                startTransition(() => {
                  updateDeliveryOption(cart.product.id, option.id);
                });
              }}
            />
            <div className={styles.optionLabel}>
              <span className={styles.deliveryDate}>
                Arrives in {option.deliveryDays} days
              </span>
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
