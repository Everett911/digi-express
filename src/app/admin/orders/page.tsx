import { Table } from "@radix-ui/themes";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatNumber } from "@/src/utils/formatters";
import { deleteOrder } from "../_actions/orders";
import RowActions from "../_components/RowActions";
import OrderStatusSelect from "../_components/OrderStatusSelect";
import { EmptyState, PageHeader, Pagination, Panel, SrOnly } from "../_components/ui";
import table from "../_components/table.module.css";
import { requireAdminPage } from "../_lib/auth";
import { formatShortDate } from "../_lib/format";
import { PAGE_SIZE, pageCount, parsePage } from "../_lib/pagination";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  await requireAdminPage();
  const page = parsePage((await searchParams).page);

  const [total, orders] = await Promise.all([
    prisma.order.count(),
    prisma.order.findMany({
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        totalCostCents: true,
        status: true,
        user: { select: { name: true, email: true } },
        items: { select: { name: true, quantity: true } },
      },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Sales"
        description={`${formatNumber(total)} ${total === 1 ? "order" : "orders"}, newest first.`}
      />
      <Panel>
        {total === 0 ? (
          <EmptyState
            title="No orders yet"
            description="Orders appear here once customers check out."
          />
        ) : (
          <>
            <Table.Root variant="ghost">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Customer</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Products</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Qty</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Total</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className={table.actions}>
                    <SrOnly>Actions</SrOnly>
                  </Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {orders.map((order) => {
                  const quantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
                  const products =
                    order.items.map((item) => item.name).join(", ") || "Unknown product";

                  return (
                    <Table.Row key={order.id} align="center">
                      <Table.RowHeaderCell>
                        <div className={table.stack}>
                          <span className={table.strong}>
                            {order.user.name || order.user.email}
                          </span>
                          {order.user.name && (
                            <span className={table.muted}>{order.user.email}</span>
                          )}
                        </div>
                      </Table.RowHeaderCell>
                      <Table.Cell>
                        <span className={table.truncate} title={products}>
                          {products}
                        </span>
                      </Table.Cell>
                      <Table.Cell className={table.number}>
                        {formatShortDate(order.createdAt)}
                      </Table.Cell>
                      <Table.Cell className={table.number}>{formatNumber(quantity)}</Table.Cell>
                      <Table.Cell className={`${table.number} ${table.strong}`}>
                        {formatCurrency(order.totalCostCents / 100)}
                      </Table.Cell>
                      <Table.Cell>
                        <OrderStatusSelect
                          orderId={order.id}
                          status={order.status}
                          label={`Status of order from ${order.user.email}`}
                        />
                      </Table.Cell>
                      <Table.Cell className={table.actions}>
                        <RowActions
                          label={`Actions for order from ${order.user.email}`}
                          onDelete={deleteOrder.bind(null, order.id)}
                          deleteConfirm="Delete this order? This can't be undone."
                        />
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Root>
            <Pagination basePath="/admin/orders" page={page} totalPages={pageCount(total)} />
          </>
        )}
      </Panel>
    </>
  );
}
