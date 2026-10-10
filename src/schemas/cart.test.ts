import { describe, expect, it } from "vitest";
import { addToCartSchema, MAX_CART_QUANTITY } from "./cart";

const productId = "2163626d-79b5-4980-ba04-33692b19bc2b";

describe("addToCartSchema", () => {
  it("accepts a valid request and turns missing options into empty strings", () => {
    expect(
      addToCartSchema.parse({ productId, quantity: 2, size: null, color: " red " }),
    ).toEqual({ productId, quantity: 2, size: "", color: "red" });
  });

  it.each([0, -1, 1.5, MAX_CART_QUANTITY + 1, Number.NaN])(
    "rejects quantity %s",
    (quantity) => {
      expect(
        addToCartSchema.safeParse({ productId, quantity, size: "", color: "" })
          .success,
      ).toBe(false);
    },
  );

  it("rejects a product id that isn't a UUID", () => {
    expect(
      addToCartSchema.safeParse({ productId: "1", quantity: 1, size: "", color: "" })
        .success,
    ).toBe(false);
  });
});
