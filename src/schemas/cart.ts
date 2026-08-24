import { z } from "zod";
import { ProductSchema } from "./products";
import { DeliveryOptionSchema } from "./deliveryOptions";

const nestedCartItemSchema = z.object({
  product: ProductSchema,
  deliveryOption: DeliveryOptionSchema,
});

const baseCartItemSchema = z.object({
  id: z.string(),
  color: z.string().nullable(),
  size: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
  productId: z.string(),
  quantity: z.number().int().positive(),
  deliveryOptionId: z.string(),
});

export const cartSchema = z
  .array(nestedCartItemSchema.extend(baseCartItemSchema.shape))
  .optional();

export type Cart = z.infer<typeof cartSchema>;
export type CartItem = z.infer<typeof baseCartItemSchema>;
