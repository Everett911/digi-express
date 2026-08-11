import dayjs from "dayjs";
import type { orderProduct } from "../../schemas/orders";


export function DeliveryDate({ estimatedDeliveryTimeMs }: orderProduct) {
  return (
    <div className="product-delivery-date">
      Arriving on: {dayjs(estimatedDeliveryTimeMs).format("MMMM D")}
    </div>
  );
}
