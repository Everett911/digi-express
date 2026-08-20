"use server";

import { headers } from "next/headers";
import Stripe from "stripe";
import { auth } from "../auth";
import { CartItems } from "@/src/schemas/cart";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

interface CheckoutParams {
  totalCostCents: number;
  cart: CartItems;
}

export async function createPaymentIntentAction({
  totalCostCents,
  cart,
}: CheckoutParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const cartIds = cart ? cart.map((item) => item.id).join(",") : "";

    const paymentIntentOptions: Stripe.PaymentIntentCreateParams = {
      amount: totalCostCents,
      currency: "usd",
      metadata: {
        cartIds,
        userId: session.user.id,
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
