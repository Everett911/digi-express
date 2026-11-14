const MODEL_PRICES: Record<string, { inputPerMillion: number; outputPerMillion: number }> = {
  "gemini-3.5-flash": { inputPerMillion: 0.75, outputPerMillion: 3.75 }, //in Google Page (ai.google.dev/gemini-api/docs/pricing) the model is no longer listed, so this uses its replacement's price and checked on Nov 12, 2026
  "gemini-3.6-flash": { inputPerMillion: 0.75, outputPerMillion: 3.75 }, //in Google Page (ai.google.dev/gemini-api/docs/pricing) the model's official price, until 31 Dec 2026 (then $1.50/$7.50) and checked on Nov 12, 2026
};

export function estimatedCostUsd(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number | null {
  const price = MODEL_PRICES[model];
  if (!price) return null;
  return (
    (inputTokens / 1000000) * price.inputPerMillion +
    (outputTokens / 1000000) * price.outputPerMillion
  );
}
const COST_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});
export function formatCostUsd(cost: number | null): string {
  if (cost === null) return "—";
  return COST_FORMATTER.format(cost);
}
