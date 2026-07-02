import { z } from "zod";

export const orderProductSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  estimatedDeliveryTimeMs: z.number().int().positive(),
  product: z
    .object({
      id: z.string(),
      image: z.string(),
      name: z.string(),
      rating: z.object({
        stars: z.number(),
        count: z.number(),
      }),
      priceCents: z.number(),
      keywords: z.array(z.string()),
    })
    .optional(),
});

export const orderSchema = z.object({
  id: z.string().uuid(),
  orderTimeMs: z.number().int().positive(),
  totalCostCents: z.number().int().nonnegative(),
  products: z.array(orderProductSchema),
});

export type Order = z.infer<typeof orderSchema>;
export type orderProduct = z.infer<typeof orderProductSchema>;
