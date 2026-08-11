import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  image: z.array(z.string()),
  name: z.string().min(1, "Name is required"),
  color: z.array(z.string()).default([]),
  size: z.array(z.string()).default([]),
  priceCents: z.number().int().nonnegative(),
  keywords: z.array(z.string()),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  isAvailableForPurchase: z.boolean().default(true),
});

export type Product = z.infer<typeof ProductSchema>;
