"use client";
import { DropdownMenu } from "@radix-ui/themes";
import { useState, useTransition } from "react";
import {
  deleteProduct,
  toggleProductAvailability,
} from "../../_actions/products";
import { useRouter } from "next/navigation";

export function ActiveToggleDropdownItem({
  id,
  isAvailableForPurchase,
}: {
  id: string;
  isAvailableForPurchase: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  return (
    <DropdownMenu.Item
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await toggleProductAvailability(id, !isAvailableForPurchase);
          router.refresh();
        });
      }}
    >
      {isAvailableForPurchase ? "Deactivate" : "Activate"}
    </DropdownMenu.Item>
  );
}

export function DeleteDropdownItem({
  id,
  disabled,
}: {
  id: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isHovered, setIsHovered] = useState(false);
  return (
    <DropdownMenu.Item
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        color: isHovered ? "white" : "black",
        backgroundColor: isHovered ? "red" : "white",
      }}
      disabled={!disabled || isPending}
      onClick={() => {
        startTransition(async () => {
          await deleteProduct(id);
          router.refresh();
        });
      }}
    >
      Delete
    </DropdownMenu.Item>
  );
}
