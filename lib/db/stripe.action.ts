"use server";

import { headers } from "next/headers";
import Stripe from "stripe";
import { auth } from "../auth";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function createPaymentIntentAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: true, deliveryOption: true },
    });

    if (cartItems.length === 0) {
      return { success: false, error: "Your cart is empty." };
    }

    const productCost = cartItems.reduce(
      (acc, i) => acc + i.product.priceCents * i.quantity,
      0,
    );

    const shippingCost = cartItems.reduce((max, item) => {
      const currentItemShipping = item.deliveryOption?.priceCents ?? 0;
      return currentItemShipping > max ? currentItemShipping : max;
    }, 0);

    const tax = Math.round((productCost + shippingCost) * 0.1);
    const totalCostCents = productCost + shippingCost + tax;

    const paymentIntentOptions: Stripe.PaymentIntentCreateParams = {
      amount: totalCostCents,
      currency: "usd",
      receipt_email: session.user.email ?? undefined,
      metadata: {
        userId: session.user.id,
        userEmail: session.user.email,
      },
    };

    if ("stripeCustomerId" in session.user && session.user.stripeCustomerId) {
      paymentIntentOptions.customer = session.user.stripeCustomerId as string;
    }

    const paymentIntent =
      await stripe.paymentIntents.create(paymentIntentOptions);

    if (!paymentIntent.client_secret) {
      throw new Error("Stripe failed to return a client secret");
    }

    return { success: true, clientSecret: paymentIntent.client_secret };
  } catch (error) {
    console.error("Secure Checkout Error:", error);
    return { success: false, error: "Internal payment processing error" };
  }
}
