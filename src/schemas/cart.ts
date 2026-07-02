import { z } from "zod";
import { productSchema } from "./products";

export const cartItemSchema = z.object({
  id: z.number().int().positive(),
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  deliveryOptionId: z.string(),
  product: productSchema,
});

export const cartSchema = z.array(cartItemSchema);

export type CartItem = z.infer<typeof cartSchema>[number];
