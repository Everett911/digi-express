export function DeliveryDate({
  estimatedDeliveryTimeMs,
}: {
  estimatedDeliveryTimeMs: string;
}) {
  return (
    <div className="product-delivery-date">
      Arriving on: {estimatedDeliveryTimeMs}
    </div>
  );
}
