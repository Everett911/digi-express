import { useEffect, useState } from "react";
import { Header } from "../../components/Header";
import "./TrackingPage.css";
import { useParams } from "react-router";
import axios from "axios";
import dayjs from "dayjs";
import {
  orderSchema,
  type orderProduct,
  type Order,
} from "../../schemas/orders";
import Footer from "../../components/Footer";

type Props = {
  totalQuantity: number;
};

export function TrackingPage({ totalQuantity }: Props) {
  const { orderId, productId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchTrackingData = async () => {
      const response = await axios.get(
        `/api/orders/${orderId}?expand=products`,
      );
      const data = orderSchema.parse(response.data);
      setOrder(data);
    };

    fetchTrackingData();
  }, [orderId]);

  if (!order || !order.products) {
    return null;
  }

  const orderProduct = order.products.find((p: orderProduct) => {
    return p.productId === productId;
  });

  if (!orderProduct || !orderProduct.product) {
    return null;
  }

  const totalDeliveryTimeMs =
    orderProduct.estimatedDeliveryTimeMs - order.orderTimeMs;

  const timePassedMs = dayjs().valueOf() - order.orderTimeMs;

  let deliveryProgCent = (timePassedMs / totalDeliveryTimeMs) * 100;

  if (deliveryProgCent > 100) {
    deliveryProgCent = 100;
  }

  const isPreparing = deliveryProgCent < 33;
  const isShipping = deliveryProgCent >= 33 && deliveryProgCent < 100;
  const isDelivered = deliveryProgCent === 100;
  return (
    <>
      <title>Tracking</title>
      <link rel="icon" type="image/svg+xml" href="/tracking-favicon.png" />

      <Header totalQuantity={totalQuantity} />

      <div className="tracking-page">
        <a className="back-to-orders-link link-primary" href="/orders">
          View all orders
        </a>
        <div className="order-tracking">
          <div className="delivery-date">
            {deliveryProgCent >= 100 ? "Delivered on " : "Arriving on "}
            {dayjs(orderProduct.estimatedDeliveryTimeMs).format("dddd, MMMM D")}
          </div>

          <div className="product-info">{orderProduct.product.name}</div>

          <div className="product-info">Quantity: {orderProduct.quantity}</div>

          <img className="product-image" src={orderProduct.product.image} />

          <div className="progress-labels-container">
            <div
              className={`progress-label ${isPreparing && "current-status"}`}
            >
              Preparing
            </div>
            <div className={`progress-label ${isShipping && "current-status"}`}>
              Shipped
            </div>
            <div
              className={`progress-label ${isDelivered && "current-status"}`}
            >
              Delivered
            </div>
          </div>

          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${deliveryProgCent}%` }}
            ></div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
