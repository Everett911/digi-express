"use server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  addToCartSchema,
  cartQuantitySchema,
  MAX_CART_QUANTITY,
  type AddToCartInput,
} from "@/src/schemas/cart";

// Errors thrown from server actions are hidden in production builds, so
// expected failures are returned instead.
export type CartActionResult =
  | { success: true }
  | { success: false; error: string; signedOut?: boolean };

const SIGNED_OUT: CartActionResult = {
  success: false,
  error: "You must be logged in to change your cart.",
  signedOut: true,
};

const cartItemIdSchema = z.uuid();

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

// Option values a product really offers; "none" is the "no option" placeholder.
function realOptions(values: string[]) {
  return values.filter((value) => value && value !== "none");
}

export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number,
): Promise<CartActionResult> {
  const userId = await getUserId();
  if (!userId) return SIGNED_OUT;

  const id = cartItemIdSchema.safeParse(cartItemId);
  const qty = cartQuantitySchema.safeParse(quantity);
  if (!id.success || !qty.success) {
    return {
      success: false,
      error: `Quantity must be between 1 and ${MAX_CART_QUANTITY}.`,
    };
  }

  // Filtering on userId stops anyone editing another customer's cart.
  await prisma.cartItem.updateMany({
    where: { id: id.data, userId },
    data: { quantity: qty.data },
  });

  revalidatePath("/checkout");
  return { success: true };
}

export async function updateDeliveryOption(
  cartItemId: string,
  deliveryOptionId: string,
): Promise<CartActionResult> {
  const userId = await getUserId();
  if (!userId) return SIGNED_OUT;

  const id = cartItemIdSchema.safeParse(cartItemId);
  const option =
    typeof deliveryOptionId === "string"
      ? await prisma.deliveryOption.findUnique({
          where: { id: deliveryOptionId },
        })
      : null;
  if (!id.success || !option) {
    return { success: false, error: "That delivery option isn't available." };
  }

  await prisma.cartItem.updateMany({
    where: { id: id.data, userId },
    data: { deliveryOptionId: option.id },
  });

  revalidatePath("/checkout");
  return { success: true };
}

export async function deleteCartItem(
  cartItemId: string,
): Promise<CartActionResult> {
  const userId = await getUserId();
  if (!userId) return SIGNED_OUT;

  const id = cartItemIdSchema.safeParse(cartItemId);
  if (!id.success) return { success: false, error: "Cart item not found." };

  await prisma.cartItem.deleteMany({ where: { id: id.data, userId } });

  revalidatePath("/checkout");
  return { success: true };
}

export async function addItemToCart(
  input: AddToCartInput,
): Promise<CartActionResult> {
  const userId = await getUserId();
  if (!userId) return SIGNED_OUT;

  const parsed = addToCartSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: `Choose a quantity between 1 and ${MAX_CART_QUANTITY}.`,
    };
  }
  const { productId, quantity, size, color } = parsed.data;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isAvailableForPurchase) {
    return { success: false, error: "This product is no longer available." };
  }

  // The size and colour must be one the product offers, or empty if it
  // offers none.
  const sizes = realOptions(product.size);
  const colors = realOptions(product.color);
  if (sizes.length > 0 ? !sizes.includes(size) : size !== "") {
    return { success: false, error: "Choose a valid size." };
  }
  if (colors.length > 0 ? !colors.includes(color) : color !== "") {
    return { success: false, error: "Choose a valid color." };
  }

  try {
    const key = { userId, productId, color, size };
    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId_color_size: key },
      select: { quantity: true },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { userId_productId_color_size: key },
        data: {
          quantity: Math.min(existing.quantity + quantity, MAX_CART_QUANTITY),
        },
      });
    } else {
      // The cheapest option is the default; shoppers can change it at checkout.
      const defaultDelivery = await prisma.deliveryOption.findFirst({
        orderBy: [{ priceCents: "asc" }, { deliveryDays: "asc" }],
      });
      if (!defaultDelivery) {
        console.error("addItemToCart: no delivery options in the database");
        return { success: false, error: "Checkout is unavailable right now." };
      }

      await prisma.cartItem.create({
        data: { ...key, quantity, deliveryOptionId: defaultDelivery.id },
      });
    }
  } catch (error) {
    console.error("addItemToCart failed:", error);
    return { success: false, error: "Couldn't add this item to your cart." };
  }

  revalidatePath("/checkout");
  revalidatePath("/");
  return { success: true };
}
