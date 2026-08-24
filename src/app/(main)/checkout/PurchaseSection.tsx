"use client";
import PurchaseForm from "./PurchaseForm";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface PurchaseSectionProps {
  clientSecret: string;
  totalCostCents: number;
}

function PurchaseSection({
  clientSecret,
  totalCostCents,
}: PurchaseSectionProps) {
  const options = {
    clientSecret,
    appearance: { theme: "flat" as const },
  };

  return (
    <Elements
      stripe={stripePromise}
      options={options}
      key={options.clientSecret}
    >
      <PurchaseForm totalCostCents={totalCostCents} />
    </Elements>
  );
}

export default PurchaseSection;
