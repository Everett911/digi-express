"use client";

import { formatMoney } from "@/src/utils/money";
import axios from "axios";
import dayjs from "dayjs";
import type { CartItem } from "@/src/schemas/cart";
import type { DeliveryOption } from "@/src/schemas/deliveryOptions";
import { authClient } from "@/lib/auth-client";

type Props = {
  cartItem: CartItem;
  deliveryOptions: DeliveryOption[];
  loadCart: () => Promise<void>;
};

export function DeliveryOptions({
  deliveryOptions,
  cartItem,
  loadCart,
}: Props) {
  const { refetch } = authClient.useSession();

  return (
    <div className="delivery-options">
      <div className="delivery-options-title">Choose a delivery option:</div>
      {deliveryOptions.map((deliveryOption) => {
        let priceString = "FREE Shipping";

        if (deliveryOption.priceCents > 0) {
          priceString = `${formatMoney(deliveryOption.priceCents)} - Shipping`;
        }

        const updateDeliveryOption = async () => {
          try {
            // Update the cart item in your database
            await axios.put(`/api/cart-items/${cartItem.productId}`, {
              deliveryOptionId: deliveryOption.id,
            });

            // Re-fetch the local cart data
            await loadCart();

            // Refetch the session to immediately reflect changes in UI
            await refetch();
          } catch (error) {
            console.error("Failed to update delivery option:", error);
          }
        };

        return (
          <div
            key={deliveryOption.id}
            className="delivery-option"
            onClick={updateDeliveryOption}
          >
            <input
              type="radio"
              checked={deliveryOption.id === cartItem.deliveryOptionId}
              readOnly // Let onClick handle the update
              className="delivery-option-input"
              name={`delivery-option-${cartItem.productId}`}
            />
            <div>
              <div className="delivery-option-date">
                {/* Dynamically calculate delivery time if it's based on current date */}
                {dayjs()
                  .add(deliveryOption.deliveryDays, "days")
                  .format("dddd, MMMM D")}
              </div>
              <div className="delivery-option-price">{priceString}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
