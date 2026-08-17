import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string().uuid(),
  image: z.array(z.string()),
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable().optional(),
  color: z.array(z.string()).default([]),
  size: z.array(z.string()).default([]),
  priceCents: z.number().int().positive("Price must be greater than 0"),
  keywords: z.array(z.string()),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),
  isAvailableForPurchase: z.boolean().default(true),
});

export type Product = z.infer<typeof ProductSchema>;
