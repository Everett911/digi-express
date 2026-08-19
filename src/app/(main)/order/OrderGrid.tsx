import type { Order } from "@/src/schemas/orders";
import { OrderItemDetails } from "./OrderItemDetails";
import { OrderHeader } from "./OrderHeader";

type Props = {
  orders: Order[];
};
export function OrderGrid({ orders }: Props) {
  return (
    <div className="orders-grid">
      {orders.map((order) => {
        return (
          <div key={order.id} className="order-container">
            <OrderHeader order={order} />
            <OrderItemDetails order={order} />
          </div>
        );
      })}
    </div>
  );
}
