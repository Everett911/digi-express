import { OrderList } from "./OrderList";
import { getOrderFromSession } from "@/lib/db/order";
import { Order } from "@/src/schemas/orders";

async function OrderPage() {
  const orders: Order[] = (await getOrderFromSession()) ?? [];
  return (
    <>
      <div></div>
      <OrderList orders={orders} />
    </>
  );
}

export default OrderPage;
