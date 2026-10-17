import type { Route } from "next";
import Image from "next/image";
import { Table } from "@radix-ui/themes";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatNumber } from "@/src/utils/formatters";
import { deleteProduct, toggleProductAvailability } from "../_actions/products";
import RowActions from "../_components/RowActions";
import { EmptyState, Pagination, SrOnly, StatusBadge, TableSkeleton } from "../_components/ui";
import { PAGE_SIZE, pageCount } from "../_lib/pagination";
import table from "../_components/table.module.css";

async function getProducts(page: number) {
  return Promise.all([
    prisma.product.count(),
    prisma.product.findMany({
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        brand: true,
        priceCents: true,
        isAvailableForPurchase: true,
        image: true,
        size: true,
        _count: { select: { orderItems: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);
}

export async function ProductTable({ page }: { page: number }) {
  const [total, products] = await getProducts(page);

  if (total === 0) {
    return (
      <EmptyState
        title="No products yet"
        description="Use “Add product” to create your first one."
      />
    );
  }

  return (
    <>
      <Table.Root variant="ghost">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Product</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Price</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Sizes</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Orders</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className={table.actions}>
              <SrOnly>Actions</SrOnly>
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {products.map((product) => {
            const orderCount = product._count.orderItems;

            return (
              <Table.Row key={product.id} align="center">
                <Table.RowHeaderCell>
                  <div className={table.primary}>
                    <div className={table.thumb}>
                      {product.image[0] && (
                        <Image
                          src={product.image[0]}
                          alt=""
                          fill
                          sizes="40px"
                          style={{ objectFit: "cover" }}
                        />
                      )}
                    </div>
                    <div className={table.stack}>
                      <span className={`${table.strong} ${table.truncate}`}>{product.name}</span>
                      <span className={table.muted}>{product.brand}</span>
                    </div>
                  </div>
                </Table.RowHeaderCell>
                <Table.Cell>
                  {product.isAvailableForPurchase ? (
                    <StatusBadge tone="success">Active</StatusBadge>
                  ) : (
                    <StatusBadge tone="neutral">Inactive</StatusBadge>
                  )}
                </Table.Cell>
                <Table.Cell className={table.number}>
                  {formatCurrency(product.priceCents / 100)}
                </Table.Cell>
                <Table.Cell>
                  <span className={`${table.muted} ${table.truncate}`}>
                    {product.size.join(", ") || "—"}
                  </span>
                </Table.Cell>
                <Table.Cell className={table.number}>{formatNumber(orderCount)}</Table.Cell>
                <Table.Cell className={table.actions}>
                  <RowActions
                    label={`Actions for ${product.name}`}
                    editHref={`/admin/products/${product.id}/edit` as Route}
                    toggle={{
                      label: product.isAvailableForPurchase ? "Deactivate" : "Activate",
                      action: toggleProductAvailability.bind(
                        null,
                        product.id,
                        !product.isAvailableForPurchase,
                      ),
                    }}
                    onDelete={deleteProduct.bind(null, product.id)}
                    deleteConfirm={`Delete “${product.name}”? This can't be undone.`}
                    deleteBlockedReason={
                      orderCount > 0
                        ? "Ordered products can't be deleted. Deactivate it instead."
                        : undefined
                    }
                  />
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
      <Pagination basePath="/admin/products" page={page} totalPages={pageCount(total)} />
    </>
  );
}

export function ProductTableSkeleton() {
  return <TableSkeleton label="Loading products" />;
}
