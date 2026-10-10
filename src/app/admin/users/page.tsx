import { Table } from "@radix-ui/themes";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatNumber } from "@/src/utils/formatters";
import { deleteUser } from "../_actions/users";
import RowActions from "../_components/RowActions";
import {
  EmptyState,
  PageHeader,
  Pagination,
  Panel,
  SrOnly,
  StatusBadge,
} from "../_components/ui";
import table from "../_components/table.module.css";
import { requireAdminPage } from "../_lib/auth";
import { formatShortDate } from "../_lib/format";
import { PAGE_SIZE, pageCount, parsePage } from "../_lib/pagination";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const session = await requireAdminPage();
  const page = parsePage((await searchParams).page);

  const [total, users] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
  ]);

  // Total spent for just the customers on this page, summed in the database.
  const spending = await prisma.order.groupBy({
    by: ["userId"],
    where: { userId: { in: users.map((user) => user.id) } },
    _sum: { totalCostCents: true },
  });
  const spentByUser = new Map(
    spending.map((row) => [row.userId, row._sum.totalCostCents ?? 0]),
  );

  return (
    <>
      <PageHeader
        title="Customers"
        description={`${formatNumber(total)} registered ${total === 1 ? "account" : "accounts"}.`}
      />
      <Panel>
        {total === 0 ? (
          <EmptyState
            title="No customers yet"
            description="Accounts appear here when people sign up."
          />
        ) : (
          <>
            <Table.Root variant="ghost">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Customer</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Joined</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Orders</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Total spent</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className={table.actions}>
                    <SrOnly>Actions</SrOnly>
                  </Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {users.map((user) => {
                  const orderCount = user._count.orders;
                  const isSelf = user.id === session.user.id;

                  return (
                    <Table.Row key={user.id} align="center">
                      <Table.RowHeaderCell>
                        <div className={table.stack}>
                          <span className={table.strong}>
                            {user.name || user.email}
                          </span>
                          {user.name && (
                            <span className={table.muted}>{user.email}</span>
                          )}
                        </div>
                      </Table.RowHeaderCell>
                      <Table.Cell>
                        <StatusBadge
                          tone={user.role === "admin" ? "accent" : "neutral"}
                        >
                          {user.role === "admin" ? "Admin" : "Customer"}
                        </StatusBadge>
                      </Table.Cell>
                      <Table.Cell className={table.number}>
                        {formatShortDate(user.createdAt)}
                      </Table.Cell>
                      <Table.Cell className={table.number}>
                        {formatNumber(orderCount)}
                      </Table.Cell>
                      <Table.Cell className={`${table.number} ${table.strong}`}>
                        {formatCurrency((spentByUser.get(user.id) ?? 0) / 100)}
                      </Table.Cell>
                      <Table.Cell className={table.actions}>
                        <RowActions
                          label={`Actions for ${user.email}`}
                          onDelete={deleteUser.bind(null, user.id)}
                          deleteConfirm={`Delete ${user.email}? This can't be undone.`}
                          deleteBlockedReason={
                            isSelf
                              ? "You can't delete your own account."
                              : orderCount > 0
                                ? "Customers with orders can't be deleted."
                                : undefined
                          }
                        />
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Root>
            <Pagination
              basePath="/admin/users"
              page={page}
              totalPages={pageCount(total)}
            />
          </>
        )}
      </Panel>
    </>
  );
}
