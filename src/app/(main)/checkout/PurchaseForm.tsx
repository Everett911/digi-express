"use client"; // Required for Stripe React hooks

import React, { useState, useTransition } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { createOrderFromCart } from "@/lib/db/cart.action";
import { useRouter } from "next/navigation";

function PurchaseForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    startTransition(async () => {
      const result = await createOrderFromCart();
      if (result.success) {
        router.push("/");
      } else {
        alert("Order placement failed.");
      }
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
        },
      });

      if (error) {
        setErrorMessage(error.message ?? "An unexpected error occurred.");
      }
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <PaymentElement />
        {errorMessage && <div>Error</div>}
        <button disabled={isPending || !stripe || !elements}>
          {isPending ? "Processing..." : "Place your order"}
        </button>
      </form>
    </>
  );
}

export default PurchaseForm;
