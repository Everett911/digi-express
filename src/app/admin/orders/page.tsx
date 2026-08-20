import AdminorderHeader from "../_components/AdminProductsHeader";
import styles from "./page.module.css";
import { DropdownMenu, Table } from "@radix-ui/themes";
import { prisma } from "@/lib/prisma";

import { DeleteDropdownItem } from "./_actions/OrderAction";
import { formatCurrency, formatNumber } from "@/src/utils/formatters";
import { MoreVertical } from "lucide-react";

export default function AdminordersPage() {
  return (
    <>
      <div className={styles.container}>
        <AdminorderHeader>Sales</AdminorderHeader>
      </div>
      <OrderTable />
    </>
  );
}

async function OrderTable() {
  const orders = await prisma.order.findMany({
    select: {
      id: true,
      totalCostCents: true,
      items: true,
    },
    orderBy: { createdAt: "asc" },
  });
  if (orders.length === 0) return <p> No order Found</p>;
  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>Product</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Quantity</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Value</Table.ColumnHeaderCell>

          <Table.ColumnHeaderCell>
            <span className={styles.span}>Actions</span>
          </Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {orders.map((order) => (
          <Table.Row key={order.id}>
            <Table.Cell>
              {order.items.map((item) => item.name).join(", ") ||
                "Unknown product"}
            </Table.Cell>
            <Table.Cell>
              {formatNumber(
                order.items.reduce((total, item) => total + item.quantity, 0),
              )}
            </Table.Cell>
            <Table.Cell>{formatCurrency(order.totalCostCents)}</Table.Cell>
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
                  <DeleteDropdownItem id={order.id} disabled={false} />
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
