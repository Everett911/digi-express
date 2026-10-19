"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@radix-ui/themes";
import type { OrderStatus } from "@prisma/client";
import { updateOrderStatus } from "../_actions/orders";

const OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "PAID", label: "Paid" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function OrderStatusSelect({
  orderId,
  status,
  label,
  disabled = false,
}: {
  orderId: string;
  status: OrderStatus;
  label: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Select.Root
      size="1"
      value={status}
      disabled={disabled || isPending}
      onValueChange={(value) =>
        startTransition(async () => {
          const result = await updateOrderStatus(orderId, value);
          if (result?.error) window.alert(result.error);
          router.refresh();
        })
      }
    >
      <Select.Trigger variant="soft" aria-label={label} />
      <Select.Content>
        {OPTIONS.map((option) => (
          <Select.Item key={option.value} value={option.value}>
            {option.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
}
