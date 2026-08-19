import { z } from "zod";

export const orderItemSchema = z.object({
  id: z.string(),
  color: z.string().nullable(),
  size: z.string().nullable(),
  name: z.string(),
  image: z.string(),
  priceCents: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  productId: z.string(),
  quantity: z.number().int().positive(),
  orderId: z.string(),
});

export const orderSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
  totalCostCents: z.number().int(),
  items: z.array(orderItemSchema),
});

export const ordersListSchema = z.array(orderSchema).optional();

export type OrderItem = z.infer<typeof orderItemSchema>;
export type Order = z.infer<typeof orderSchema>;
export type OrdersList = z.infer<typeof ordersListSchema>;
