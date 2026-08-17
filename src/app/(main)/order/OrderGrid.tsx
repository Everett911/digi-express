import type { Order } from "@/src/schemas/orders";
import { CartItemDetails } from "./CartItemDetails";
import { OrderHeader } from "./OrderHeader";

type Props = {
  orders: Order[];
  loadCart: () => Promise<void>;
};
export function OrderGrid({ orders, loadCart }: Props) {
  return (
    <div className="orders-grid">
      {orders.map((order) => {
        return (
          <div key={order.id} className="order-container">
            <OrderHeader order={order} />
            <CartItemDetails order={order} loadCart={loadCart} />
          </div>
        );
      })}
    </div>
  );
}
