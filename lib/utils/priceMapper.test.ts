import { describe, expect, it } from "vite-plus/test";
import { mapPriceGroupsToPrisma, PRICE_GROUPS, priceGroupToRange } from "./priceMapper";

describe("priceGroupToRange", () => {
  it("parses each filter bucket into a [min, max) range in cents", () => {
    expect(priceGroupToRange("Under $10")).toEqual({ lt: 1000 });
    expect(priceGroupToRange("$10 - $25")).toEqual({ gte: 1000, lt: 2500 });
    expect(priceGroupToRange("Over $100")).toEqual({ gte: 10000 });
  });

  it("accepts older labels such as the header's Under $75", () => {
    expect(priceGroupToRange("under $75")).toEqual({ lt: 7500 });
  });

  it("returns null for labels it can't parse", () => {
    expect(priceGroupToRange("cheap")).toBeNull();
    expect(priceGroupToRange("Under $")).toBeNull();
  });

  it("puts a boundary price in exactly one bucket", () => {
    const price = 2500;
    const matches = PRICE_GROUPS.filter((group) => {
      const range = priceGroupToRange(group)!;
      const min = typeof range.gte === "number" ? range.gte : -Infinity;
      const max = typeof range.lt === "number" ? range.lt : Infinity;
      return min <= price && price < max;
    });
    expect(matches).toEqual(["$25 - $50"]);
  });
});

describe("mapPriceGroupsToPrisma", () => {
  it("drops labels it can't parse", () => {
    expect(mapPriceGroupsToPrisma(["Under $10", "nonsense"])).toEqual([
      { priceCents: { lt: 1000 } },
    ]);
  });
});
