"use server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createOrderFromCart() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be logged in to place an order.");
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const cartItems = await tx.cartItem.findMany({
        where: { userId: session.user.id },
        include: { product: true, deliveryOption: true },
      });

      if (cartItems.length === 0) {
        throw new Error("Your cart is empty.");
      }

      const productCost = cartItems.reduce(
        (acc, i) => acc + i.product.priceCents * i.quantity,
        0,
      );

      const shipCost = cartItems.reduce((max, item) => {
        const currentItemShipping = item.deliveryOption?.priceCents ?? 0;
        return currentItemShipping > max ? currentItemShipping : max;
      }, 0);
      const shippingCost = Math.round(shipCost / 100);
      const tax = Math.round((productCost + shippingCost) * 0.1);
      const totalCost = productCost + shippingCost + tax;

      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          totalCostCents: totalCost,
          items: {
            create: cartItems.map((item) => {
              let itemImage = "";
              if (Array.isArray(item.product.image)) {
                itemImage = item.product.image[0] || "";
              } else if (typeof item.product.image === "string") {
                itemImage = item.product.image;
              }

              return {
                productId: item.productId,
                quantity: item.quantity,
                color: item.color ?? null,
                size: item.size ?? null,
                image: itemImage,
                priceCents: item.product.priceCents,
                name: item.product.name,
                deliveryDays: item.deliveryOption.deliveryDays,
              };
            }),
          },
        },
        include: {
          items: true,
        },
      });
      await tx.cartItem.deleteMany({
        where: { userId: session.user.id },
      });

      return newOrder;
    });

    revalidatePath("/");
    revalidatePath("/checkout");
    revalidatePath("/orders");

    return { success: true, orderId: order.id };
  } catch (error: unknown) {
    console.error("Prisma Transaction Error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to process transaction.";

    return {
      success: false,
      error: message,
    };
  }
}

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
