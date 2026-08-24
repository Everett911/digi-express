import { CartItem } from "@/.prisma/client/client";
type CartItemWithRelations = CartItem & {
  product: { priceCents: number };
  deliveryOption?: { priceCents: number } | null;
};

export async function getPaymentSummary(cart: CartItemWithRelations[]) {
  if (!cart || cart.length === 0) {
    return {
      totalItems: 0,
      productCostCents: 0,
      shippingCostCents: 0,
      totalCostBeforeTaxCents: 0,
      taxCents: 0,
      totalCostCents: 0,
    };
  }

  const productCostCents = cart.reduce(
    (acc: number, item: CartItemWithRelations) => {
      return acc + item.product?.priceCents * item.quantity;
    },
    0,
  );

  const shipCostCents = cart.reduce(
    (max: number, item: CartItemWithRelations) => {
      const currentItemShipping = item.deliveryOption?.priceCents ?? 0;
      return currentItemShipping > max ? currentItemShipping : max;
    },
    0,
  );
  const shippingCostCents = shipCostCents;

  const totalCostBeforeTaxCents = productCostCents + shippingCostCents;
  const taxCents = Math.round(totalCostBeforeTaxCents * 0.1);
  const totalCostCents = totalCostBeforeTaxCents + taxCents;

  const totalItems = cart.reduce(
    (acc: number, item: CartItemWithRelations) => acc + item.quantity,
    0,
  );

  return {
    totalItems,
    productCostCents,
    shippingCostCents,
    totalCostBeforeTaxCents,
    taxCents,
    totalCostCents,
  };
}
