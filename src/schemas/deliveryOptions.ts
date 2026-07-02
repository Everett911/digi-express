import { z } from "zod";

export const deliveryOptionSchema = z.object({
  id: z.string(),
  deliveryDays: z.number().int().nonnegative(),
  priceCents: z.number().int().nonnegative(),
  estimatedDeliveryTimeMs: z.number().int().positive(),
});

export type Delivery = z.infer<typeof deliveryOptionSchema>;
