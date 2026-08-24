import { Table } from "@radix-ui/themes";
import { prisma } from "@/lib/prisma";
import { CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/src/utils/formatters";
import styles from "./page.module.css";
import { ProductRowActions } from "./_components/ProductRowActions";

interface ProductTableProps {
  page: number;
  limit: number;
}

async function getProduct({ page, limit }: ProductTableProps) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);

  const products = await prisma.product.findMany({
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
    select: {
      id: true,
      name: true,
      priceCents: true,
      isAvailableForPurchase: true,
      image: true,
      size: true,
      keywords: true,
    },
    orderBy: { name: "asc" },
  });
  return products;
}

export async function ProductTable({ page, limit }: ProductTableProps) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);

  const products = await getProduct({ page: safePage, limit: safeLimit });

  if (products.length === 0)
    return <p className={styles.empty}>No Products Found</p>;

  return (
    <div className={styles.tableWrapper}>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>
              <span className={styles.span}>Available For Purchase</span>
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Price</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Image</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Size</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Keyword</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <span className={styles.span}>Actions</span>
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {products.map((product) => {
            const sizesList = product.size.join(", ");
            const dollarAmount = (product.priceCents / 100).toFixed(2);

            return (
              <Table.Row key={product.id}>
                <Table.RowHeaderCell>
                  {product.isAvailableForPurchase ? (
                    <>
                      <CheckCircle color="green" size={18} />
                      <span className={styles.span}>Available</span>
                    </>
                  ) : (
                    <>
                      <XCircle color="red" size={18} />
                      <span className={styles.span}>Unavailable</span>
                    </>
                  )}
                </Table.RowHeaderCell>
                <Table.Cell>{product.name}</Table.Cell>
                <Table.Cell>{formatCurrency(Number(dollarAmount))}</Table.Cell>
                <Table.Cell>{product.image.length}</Table.Cell>
                <Table.Cell>{sizesList}</Table.Cell>
                <Table.Cell>{product.keywords.length}</Table.Cell>
                <Table.Cell>
                  <ProductRowActions
                    productId={product.id}
                    isAvailableForPurchase={product.isAvailableForPurchase}
                    spanClassName={styles.span}
                  />
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>

      <div className={styles.paginationControls}>
        <Link
          href={`/admin/products?page=${safePage - 1}`}
          className={safePage <= 1 ? styles.disabled : ""}
        >
          Previous
        </Link>
        <span>Page {safePage}</span>
        <Link href={`/admin/products?page=${safePage + 1}`} className={""}>
          Next
        </Link>
      </div>
    </div>
  );
}

export function ProductTableSkeleton() {
  return <p>Loading product database...</p>;
}
