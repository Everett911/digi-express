import { describe, expect, it } from "vitest";
import { buildOrderItemData, calculateCartTotals } from "./checkout";

const item = (priceCents: number, quantity: number, shipping = 0) => ({
  product: { priceCents },
  deliveryOption: { priceCents: shipping },
  quantity,
});

describe("calculateCartTotals", () => {
  it("returns zeros for an empty cart", () => {
    expect(calculateCartTotals([])).toEqual({
      productCostCents: 0,
      shippingCostCents: 0,
      taxCents: 0,
      totalCostCents: 0,
      totalItems: 0,
    });
  });

  it("charges the most expensive shipping option once, not per item", () => {
    const totals = calculateCartTotals([item(1000, 2, 499), item(500, 1, 999)]);
    expect(totals.productCostCents).toBe(2500);
    expect(totals.shippingCostCents).toBe(999);
    expect(totals.totalItems).toBe(3);
  });

  it("adds 10% tax on products plus shipping, rounded to the cent", () => {
    const totals = calculateCartTotals([item(1005, 1, 0)]);
    expect(totals.taxCents).toBe(101);
    expect(totals.totalCostCents).toBe(1106);
  });
});

describe("buildOrderItemData", () => {
  const product = { id: "p1", name: "Tee", priceCents: 1200 };

  it("stores empty colour and size as null", () => {
    const [row] = buildOrderItemData([
      { product: { ...product, image: ["/a.png"] }, quantity: 1, color: "", size: "" },
    ]);
    expect(row.color).toBeNull();
    expect(row.size).toBeNull();
  });

  it("uses the first image and the delivery days", () => {
    const [row] = buildOrderItemData([
      {
        product: { ...product, image: ["/a.png", "/b.png"] },
        deliveryOption: { priceCents: 0, deliveryDays: 7 },
        quantity: 2,
        color: "red",
        size: "m",
      },
    ]);
    expect(row).toMatchObject({
      productId: "p1",
      image: "/a.png",
      deliveryDays: 7,
      color: "red",
      size: "m",
      quantity: 2,
    });
  });
});
