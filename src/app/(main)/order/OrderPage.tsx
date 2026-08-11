import axios from "axios";
import { useState, useEffect } from "react";
import { Header } from "../../components/Header/Header";
import { OrderGrid } from "./OrderGrid";
import "./OrderPage.css";
import { type Order, orderSchema } from "../../schemas/orders";
import Footer from "../../components/Footer/Footer";

type Props = {
  totalQuantity: number;
  loadCart: () => Promise<void>;
};
export function OrderPage({ totalQuantity, loadCart }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrderData = async () => {
      const response = await axios.get("/api/orders?expand=products");
      const data = orderSchema.array().parse(response.data);
      setOrders(data);
    };

    fetchOrderData();
  }, []);
  return (
    <>
      <title>Orders</title>
      <link rel="icon" type="image/svg+xml" href="/orders-favicon.png" />

      <Header totalQuantity={totalQuantity} />

      <div className="orders-page">
        <div className="page-title">Your Orders</div>

        <OrderGrid orders={orders} loadCart={loadCart} />
      </div>
      <Footer />
    </>
  );
}
