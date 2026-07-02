import { z } from "zod";

export const paymentSummarySchema = z.object({
  totalItems: z.number().int().nonnegative(),
  productCostCents: z.number().int().nonnegative(),
  shippingCostCents: z.number().int().nonnegative(),
  totalCostBeforeTaxCents: z.number().int().nonnegative(),
  taxCents: z.number().int().nonnegative(),
  totalCostCents: z.number().int().nonnegative(),
});

export type PaymentSummary = z.infer<typeof paymentSummarySchema>;
