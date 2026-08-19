"use client";
import { Fragment, useTransition } from "react";
import { DeliveryDate } from "./DeliveryDate";
import styles from "./OrderPage.module.css";
import type { Order, OrderItem } from "@/src/schemas/orders";
import Image from "next/image";
import { addDays, formatDate } from "@/src/utils/formatters";
import { addItemToCart } from "@/lib/db/cart.action";
import { RotateCcwSquareIcon } from "lucide-react";

type Props = {
  order: Order;
};
export function OrderItemDetails({ order }: Props) {
  const [isPending, startTransition] = useTransition();
  return (
    <div className={styles.orderDetailsGrid}>
      {order.items.map((item: OrderItem) => {
        const deliveryDate = addDays(item.createdAt, 7);

        const handleAddToCart = () => {
          startTransition(async () => {
            try {
              await addItemToCart({
                productId: item.id,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
              });
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : String(err);
              alert(message || "Something went wrong.");
            }
          });
        };
        return (
          <Fragment key={item.id}>
            <div className={styles.productImageContainer}>
              <Image
                src={item.image}
                width={150}
                height={150}
                alt="product image"
              />
            </div>

            <div className={styles.productDetails}>
              <div className={styles.productName}>{item.name}</div>

              <DeliveryDate
                estimatedDeliveryTimeMs={formatDate(deliveryDate)}
              />

              <div className={styles.productQuantity}>
                Quantity: {item.quantity}
              </div>
              <button className={styles.buyAgainButton}>
                <RotateCcwSquareIcon color="white" size={20} />
                <span className="buy-again-message" onClick={handleAddToCart}>
                  Add to Cart
                </span>
              </button>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
