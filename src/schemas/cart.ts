import { z } from "zod";
import { ProductSchema } from "./products";
import { DeliveryOptionSchema } from "./deliveryOptions";

export const MAX_CART_QUANTITY = 10;

export const cartQuantitySchema = z
  .number()
  .int()
  .min(1)
  .max(MAX_CART_QUANTITY);

// Size and colour are "" when the product doesn't have that option.
const optionSchema = z
  .string()
  .nullish()
  .transform((value) => value?.trim() ?? "");

// Server actions are public endpoints, so everything they receive is checked.
export const addToCartSchema = z.object({
  productId: z.uuid(),
  quantity: cartQuantitySchema,
  size: optionSchema,
  color: optionSchema,
});

export type AddToCartInput = z.input<typeof addToCartSchema>;

const nestedCartItemSchema = z.object({
  product: ProductSchema,
  deliveryOption: DeliveryOptionSchema,
});

const baseCartItemSchema = z.object({
  id: z.string(),
  color: z.string(),
  size: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
  productId: z.string(),
  quantity: cartQuantitySchema,
  deliveryOptionId: z.string(),
});

export const cartSchema = z
  .array(nestedCartItemSchema.extend(baseCartItemSchema.shape))
  .optional();

export type Cart = z.infer<typeof cartSchema>;
export type CartItem = z.infer<typeof baseCartItemSchema>;
