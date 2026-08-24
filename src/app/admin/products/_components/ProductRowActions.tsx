"use client"; // 👈 This isolates Radix from the Next.js Server Component compiler

import { DropdownMenu, Button, Flex, Text } from "@radix-ui/themes";
import { MoreVertical } from "lucide-react";
import Link from "next/link";
import { ActiveToggleDropdownItem, DeleteDropdownItem } from "./ProductActions";

interface ProductRowActionsProps {
  productId: string;
  isAvailableForPurchase: boolean;
  spanClassName?: string;
}

export function ProductRowActions({
  productId,
  isAvailableForPurchase,
  spanClassName,
}: ProductRowActionsProps) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger>
        <Button variant="ghost" color="gray" style={{ cursor: "pointer" }}>
          <Flex align="center" gap="1" asChild={false}>
            <MoreVertical size={18} />
            <Text size="2" className={spanClassName}>
              Action
            </Text>
          </Flex>
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        <DropdownMenu.Item asChild>
          <Link href={`/admin/products/${productId}/download`}>Download</Link>
        </DropdownMenu.Item>
        <DropdownMenu.Item asChild>
          <Link href={`/admin/products/${productId}/edit`}>Edit</Link>
        </DropdownMenu.Item>
        <ActiveToggleDropdownItem
          id={productId}
          isAvailableForPurchase={isAvailableForPurchase}
        />
        <DeleteDropdownItem id={productId} disabled={isAvailableForPurchase} />
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
