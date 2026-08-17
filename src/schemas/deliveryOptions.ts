import { z } from "zod";

export const DeliveryOptionSchema = z.object({
  id: z.string(),
  deliveryDays: z.number().int(),
  priceCents: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DeliveryOption = z.infer<typeof DeliveryOptionSchema>;
