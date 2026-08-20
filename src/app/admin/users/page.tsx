import AdminUsersHeader from "../_components/AdminProductsHeader";
import styles from "./page.module.css";
import { DropdownMenu, Table } from "@radix-ui/themes";
import { prisma } from "@/lib/prisma";

import { DeleteDropdownItem } from "./_actions/UserActions";
import { formatCurrency, formatNumber } from "@/src/utils/formatters";
import { MoreVertical } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <>
      <div className={styles.container}>
        <AdminUsersHeader>Costumer</AdminUsersHeader>
      </div>
      <UserTable />
    </>
  );
}

async function UserTable() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      orders: true,
    },
    orderBy: { name: "asc" },
  });
  if (users.length === 0) return <p> No Users Found</p>;
  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Orders</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Value</Table.ColumnHeaderCell>

          <Table.ColumnHeaderCell>
            <span className={styles.span}>Actions</span>
          </Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {users.map((user) => (
          <Table.Row key={user.id}>
            <Table.Cell>{user.email}</Table.Cell>
            <Table.Cell>{formatNumber(user.orders.length)}</Table.Cell>
            <Table.Cell>
              {formatCurrency(
                user.orders.reduce((sum, o) => o.totalCostCents + sum, 0),
              )}
            </Table.Cell>
            <Table.Cell>
              <DropdownMenu.Root modal={false}>
                <DropdownMenu.Trigger>
                  <button
                    style={{ border: "none", backgroundColor: "transparent" }}
                  >
                    <MoreVertical />
                    <span className={styles.span}>Action</span>
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DeleteDropdownItem id={user.id} disabled={false} />
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
