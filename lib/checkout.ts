export interface CartItemForTotals {
  product: {
    priceCents: number;
  };
  deliveryOption?: {
    priceCents: number;
  } | null;
  quantity: number;
}

export interface CartItemForOrder {
  product: {
    priceCents: number;
    image?: string | string[];
    id: string;
    name: string;
  };
  deliveryOption?: {
    priceCents: number;
    deliveryDays: number;
  } | null;
  quantity: number;
  color?: string | null;
  size?: string | null;
}

export function calculateCartTotals(
  cart: CartItemForTotals[],
): {
  productCostCents: number;
  shippingCostCents: number;
  taxCents: number;
  totalCostCents: number;
  totalItems: number;
} {
  const productCostCents = cart.reduce(
    (acc, item) => acc + item.product.priceCents * item.quantity,
    0,
  );

  const shippingCostCents = cart.reduce((max, item) => {
    const currentItemShipping = item.deliveryOption?.priceCents ?? 0;
    return currentItemShipping > max ? currentItemShipping : max;
  }, 0);

  const taxCents = Math.round(
    (productCostCents + shippingCostCents) * 0.1,
  );
  const totalCostCents = productCostCents + shippingCostCents + taxCents;
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return {
    productCostCents,
    shippingCostCents,
    taxCents,
    totalCostCents,
    totalItems,
  };
}

export function buildOrderItemData(
  cart: CartItemForOrder[],
): Array<{
  productId: string;
  quantity: number;
  color: string | null;
  size: string | null;
  image: string;
  priceCents: number;
  name: string;
  deliveryDays: number;
}> {
  return cart.map((item) => {
    let itemImage = "";
    if (Array.isArray(item.product.image)) {
      const firstImg = item.product.image[0];
      itemImage = typeof firstImg === "string" ? firstImg : "";
    } else if (typeof item.product.image === "string") {
      itemImage = item.product.image;
    }

    return {
      productId: item.product.id,
      quantity: item.quantity,
      color: item.color ?? null,
      size: item.size ?? null,
      image: itemImage,
      priceCents: item.product.priceCents,
      name: item.product.name,
      deliveryDays: item.deliveryOption?.deliveryDays ?? 0,
    };
  });
}
