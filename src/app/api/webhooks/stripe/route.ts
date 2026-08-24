import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { formatCurrency } from "@/src/utils/formatters";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const resend = new Resend(process.env.RESEND_API_KEY as string);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOKS_SECRET_KEY as string,
    );
  } catch (err: any) {
    console.error(`❌ Webhook Signature Verification Failed: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 },
    );
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const userId = paymentIntent.metadata?.userId;

    const customerEmail =
      paymentIntent.metadata?.userEmail || paymentIntent.receipt_email;

    if (!userId) {
      console.error(
        `❌ No userId found in payment intent metadata for: ${paymentIntent.id}`,
      );
      return NextResponse.json(
        { error: "No userId found in payment intent metadata" },
        { status: 400 },
      );
    }

    if (!customerEmail) {
      console.error(`❌ Email missing for payment intent: ${paymentIntent.id}`);
      return NextResponse.json(
        { error: "No customer email found for confirmation" },
        { status: 400 },
      );
    }

    try {
      let createdOrder: any = null;

      await prisma.$transaction(async (tx) => {
        const cartItems = await tx.cartItem.findMany({
          where: { userId },
          include: { product: true, deliveryOption: true },
        });

        if (cartItems.length === 0) return;

        const productCost = cartItems.reduce(
          (acc, i) => acc + i.product.priceCents * i.quantity,
          0,
        );
        const shippingCost = cartItems.reduce((max, item) => {
          const currentItemShipping = item.deliveryOption?.priceCents ?? 0;
          return currentItemShipping > max ? currentItemShipping : max;
        }, 0);
        const tax = Math.round((productCost + shippingCost) * 0.1);
        const totalCost = productCost + shippingCost + tax;

        createdOrder = await tx.order.create({
          data: {
            userId,
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
                  deliveryDays: item.deliveryOption?.deliveryDays ?? 0,
                };
              }),
            },
          },
          include: {
            items: true,
          },
        });

        await tx.cartItem.deleteMany({ where: { userId } });
      });

      if (createdOrder) {
        try {
          await resend.emails.send({
            from: "Your Shop <onboarding@resend.dev>",
            to: customerEmail,
            subject: `Order Confirmation #${createdOrder.id}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Thank you for your order!</h2>
                <p>Your payment was successful. We are getting your order ready to ship.</p>
                <hr />
                <h3>Order Total: $${formatCurrency(createdOrder.totalCostCents / 100)}</h3>
                <h4>Items Ordered:</h4>
                <ul>
                  ${createdOrder.items
                    .map(
                      (item: any) => `
                    <li>
                      <strong>${item.name}</strong> (x${item.quantity}) - 
                      $${((item.priceCents * item.quantity) / 100).toFixed(2)}
                      ${item.size ? `<br/><small>Size: ${item.size}</small>` : ""}
                      ${item.color ? `<br/><small>Color: ${item.color}</small>` : ""}
                    </li>
                  `,
                    )
                    .join("")}
                </ul>
              </div>
            `,
          });
          console.log(`✅ Confirmation email sent to ${customerEmail}`);
        } catch (emailError) {
          console.error("⚠️ Resend Email Delivery Failure:", emailError);
        }
      }

      revalidatePath("/");
      revalidatePath("/checkout");
      revalidatePath("/orders");

      return NextResponse.json(
        { success: true, ordered: true },
        { status: 200 },
      );
    } catch (error) {
      console.error("❌ Webhook Order Creation Failure:", error);
      return NextResponse.json(
        { error: "Failed to create database order" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json(
    { received: true, type: event.type },
    { status: 200 },
  );
}
