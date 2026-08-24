"use client";

import React, { useState, useTransition } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import styles from "./PurchaseForm.module.css";
import { formatCurrency } from "@/src/utils/formatters";
import { createPaymentIntentAction } from "@/lib/db/stripe.action";

function PurchaseForm({ totalCostCents }: { totalCostCents: number }) {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    startTransition(async () => {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message ?? "Validation failed.");
        return;
      }

      const res = await createPaymentIntentAction();

      if (!res.success || !res.clientSecret) {
        setErrorMessage(res.error ?? "Failed to initialize payment.");
        return;
      }

      const baseUrl =
        process.env.NEXT_PUBLIC_SERVER_URL || window.location.origin;

      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret: res.clientSecret,
        confirmParams: {
          return_url: `${baseUrl}/order`,
        },
      });

      if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
          setErrorMessage(error.message ?? "An error occurred with your card.");
        } else {
          setErrorMessage("An unknown error occurred.");
        }
      }
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={styles.container}>
        <PaymentElement />

        {errorMessage && <div className={styles.errorText}>{errorMessage}</div>}

        <button
          type="submit"
          className={styles.placeOrderButton}
          disabled={isPending || !stripe || !elements}
        >
          {isPending
            ? "Processing..."
            : `Place your order - ${formatCurrency(totalCostCents / 100)}`}
        </button>
      </form>
    </>
  );
}

export default PurchaseForm;
