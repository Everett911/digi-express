import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { formatCurrency } from "@/src/utils/formatters";
import { Order } from "@/src/schemas/orders";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const resend = new Resend(process.env.RESEND_API_KEY as string);

type CreatedOrder = Order;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET_KEY as string,
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(` Webhook Signature Verification Failed: ${errorMessage}`);
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 },
    );
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const metadata = paymentIntent.metadata;

    const userId = metadata.userId;
    const customerEmail = metadata.userEmail || paymentIntent.receipt_email;

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
      const createdOrder = await prisma.$transaction(async (tx) => {
        const cartItems = await tx.cartItem.findMany({
          where: { userId },
          include: { product: true, deliveryOption: true },
        });

        if (cartItems.length === 0) return null;

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

        const orderResult = await tx.order.create({
          data: {
            userId,
            totalCostCents: totalCost,
            items: {
              create: cartItems.map((item) => {
                let itemImage = "";
                if (Array.isArray(item.product.image)) {
                  const firstImg = item.product.image[0];
                  itemImage = typeof firstImg === "string" ? firstImg : "";
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

        return orderResult as unknown as CreatedOrder;
      });

      if (createdOrder) {
        try {
          await resend.emails.send({
            from: "Digi-Express <digi_express.gmail.com>",
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
                      (item) => `
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
          console.log(` Confirmation email sent to ${customerEmail}`);
        } catch (emailError: unknown) {
          const emailMessage =
            emailError instanceof Error
              ? emailError.message
              : "Unknown email error";
          console.error(` Resend Email Delivery Failure: ${emailMessage}`);
        }
      }

      revalidatePath("/");
      revalidatePath("/checkout");
      revalidatePath("/order");

      return NextResponse.json(
        { success: true, ordered: true },
        { status: 200 },
      );
    } catch (error: unknown) {
      const dbErrorMessage =
        error instanceof Error ? error.message : "Unknown DB error";
      console.error(` Webhook Order Creation Failure: ${dbErrorMessage}`);
      return NextResponse.json(
        { error: "Failed to create database order" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
