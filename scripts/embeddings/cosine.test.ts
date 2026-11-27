import { describe, expect, it } from "vite-plus/test";
import { cosineSimilarity as sdkCosine } from "ai";
import { cosineSimilarity } from "./cosine";

describe("cosineSimilarity", () => {
  it("same direction = 1", () => {
    const a = [1, 0];
    const b = [1, 0];
    expect(cosineSimilarity(a, b)).toBeCloseTo(1);
    expect(cosineSimilarity(a, b)).toBeCloseTo(sdkCosine(a, b));
  });
  it("vectors that point at 90 degree to each other", () => {
    const a = [0, 1];
    const b = [1, 0];
    expect(cosineSimilarity(a, b)).toBeCloseTo(0);
    expect(cosineSimilarity(a, b)).toBeCloseTo(sdkCosine(a, b));
  });
  it("vectors that point at 180 degree in opposite directions", () => {
    const a = [-1, 0];
    const b = [1, 0];
    expect(cosineSimilarity(a, b)).toBeCloseTo(-1);
    expect(cosineSimilarity(a, b)).toBeCloseTo(sdkCosine(a, b));
  });
  it("zero vector = 0", () => {
    const a = [0, 0];
    const b = [1, 0];
    expect(cosineSimilarity(a, b)).toBeCloseTo(0);
    expect(cosineSimilarity(a, b)).toBeCloseTo(sdkCosine(a, b));
  });
});
