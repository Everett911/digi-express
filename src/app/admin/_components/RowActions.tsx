"use client";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { DropdownMenu, IconButton } from "@radix-ui/themes";
import { MoreHorizontal } from "lucide-react";
import styles from "./RowActions.module.css";

type ActionResult = { error?: string } | void;

interface RowActionsProps {
  // Names the row for screen readers, e.g. "Actions for Blue Hoodie".
  label: string;
  editHref?: Route;
  toggle?: { label: string; action: () => Promise<ActionResult> };
  // Pass a bound server action, e.g. deleteOrder.bind(null, order.id).
  onDelete?: () => Promise<ActionResult>;
  deleteConfirm?: string;
  // When set, Delete is disabled and this explains why.
  deleteBlockedReason?: string;
}

export default function RowActions({
  label,
  editHref,
  toggle,
  onDelete,
  deleteConfirm = "Delete this item? This can't be undone.",
  deleteBlockedReason,
}: RowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const run = (action: () => Promise<ActionResult>) => {
    startTransition(async () => {
      const result = await action();
      if (result?.error) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger>
        <IconButton variant="ghost" color="gray" aria-label={label} disabled={isPending}>
          <MoreHorizontal size={18} />
        </IconButton>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content align="end">
        {editHref && (
          <DropdownMenu.Item asChild>
            <Link href={editHref}>Edit</Link>
          </DropdownMenu.Item>
        )}
        {toggle && (
          <DropdownMenu.Item disabled={isPending} onSelect={() => run(toggle.action)}>
            {toggle.label}
          </DropdownMenu.Item>
        )}
        {onDelete && (
          <>
            {(editHref || toggle) && <DropdownMenu.Separator />}
            <DropdownMenu.Item
              color="red"
              disabled={isPending || Boolean(deleteBlockedReason)}
              onSelect={() => {
                if (window.confirm(deleteConfirm)) run(onDelete);
              }}
            >
              Delete
            </DropdownMenu.Item>
            {deleteBlockedReason && <p className={styles.reason}>{deleteBlockedReason}</p>}
          </>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
