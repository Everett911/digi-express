import { z } from "zod";

export const productSchema = z.object({
  id: z.string().uuid(),
  image: z.array(z.string()),
  name: z.string(),
  rating: z.object({
    stars: z.number().min(0).max(5),
    count: z.number().int().nonnegative(),
  }),
  priceCents: z.number().int().nonnegative(),
  keywords: z.array(z.string()),
});

export type Product = z.infer<typeof productSchema>;
