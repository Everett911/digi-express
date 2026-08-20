"use client";
import { DropdownMenu } from "@radix-ui/themes";
import { useState, useTransition } from "react";
import { deleteOrder } from "../../_actions/orders";
import { useRouter } from "next/navigation";

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
          await deleteOrder(id);
          router.refresh();
        });
      }}
    >
      Delete
    </DropdownMenu.Item>
  );
}
