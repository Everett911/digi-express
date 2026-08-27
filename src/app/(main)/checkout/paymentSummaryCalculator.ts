import { CartItem } from "@prisma/client";
import { calculateCartTotals } from "@/lib/checkout";

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

  const totals = calculateCartTotals(cart);

  return {
    totalItems: totals.totalItems,
    productCostCents: totals.productCostCents,
    shippingCostCents: totals.shippingCostCents,
    totalCostBeforeTaxCents: totals.productCostCents + totals.shippingCostCents,
    taxCents: totals.taxCents,
    totalCostCents: totals.totalCostCents,
  };
}
