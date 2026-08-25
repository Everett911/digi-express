"use server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateCartItemQuantity(
  productId: string,
  quantity: number,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  if (quantity <= 0) return deleteCartItem(productId);

  await prisma.cartItem.update({
    where: {
      userId_productId: { userId: session.user.id, productId },
    },
    data: { quantity },
  });

  revalidatePath("/checkout");
  return { success: true };
}

export async function updateDeliveryOption(
  productId: string,
  deliveryOptionId: string,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  if (!deliveryOptionId) return deleteCartItem(productId);

  await prisma.cartItem.update({
    where: {
      userId_productId: { userId: session.user.id, productId },
    },
    data: { deliveryOptionId },
  });

  revalidatePath("/checkout");
  return { success: true };
}

export async function deleteCartItem(productId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await prisma.cartItem.delete({
    where: {
      userId_productId: { userId: session.user.id, productId },
    },
  });

  revalidatePath("/checkout");
  return { success: true };
}

export async function addItemToCart(data: {
  productId: string;
  quantity: number;
  size: string | null;
  color: string | null;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be logged in to add items to your cart.");
  }

  const defaultDelivery = await prisma.deliveryOption.findFirst();
  if (!defaultDelivery) {
    throw new Error("No delivery options configured in database.");
  }

  try {
    const normalizedSize = data.size && data.size.trim() ? data.size : null;
    const normalizedColor = data.color && data.color.trim() ? data.color : null;

    await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: data.productId,
        },
      },
      update: {
        quantity: { increment: data.quantity },
        size: normalizedSize,
        color: normalizedColor,
      },
      create: {
        userId: session.user.id,
        productId: data.productId,
        quantity: data.quantity,
        size: normalizedSize,
        color: normalizedColor,
        deliveryOptionId: defaultDelivery.id,
      },
    });

    revalidatePath("/checkout");
    revalidatePath("/");

    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update cart.",
    };
  }
}
