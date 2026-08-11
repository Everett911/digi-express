import AdminProductsHeader from "../_components/AdminProductsHeader";
import styles from "./page.module.css";
import ButtonLink from "../_components/ButtonLink";
import { DropdownMenu, Table } from "@radix-ui/themes";
import { prisma } from "../../../../lib/prisma";
import { CheckCircle, MoreVertical, XCircle } from "lucide-react";
import Link from "next/link";
import {
  ActiveToggleDropdownItem,
  DeleteDropdownItem,
} from "./_components/ProductActions";

export default function AdminProductsPage() {
  return (
    <>
      <div className={styles.container}>
        <AdminProductsHeader>Products</AdminProductsHeader>
        <ButtonLink>Add Products</ButtonLink>
      </div>
      <ProductTable />
    </>
  );
}

async function ProductTable() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      priceCents: true,
      isAvailableForPurchase: true,
      image: true,
      color: true,
      size: true,
      keywords: true,
    },
    orderBy: { name: "asc" },
  });
  if (products.length === 0) return <p> No Products Found</p>;
  return (
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
        {products.map((product) => (
          <Table.Row key={product.id}>
            {product.isAvailableForPurchase ? (
              <Table.RowHeaderCell>
                <CheckCircle />
                <span className={styles.span}>Available</span>
              </Table.RowHeaderCell>
            ) : (
              <Table.RowHeaderCell>
                <XCircle color="red" />
                <span className={styles.span}>Unavailable</span>
              </Table.RowHeaderCell>
            )}
            <Table.Cell>{product.name}</Table.Cell>
            <Table.Cell>{product.priceCents}</Table.Cell>
            <Table.Cell>{product.image.length}</Table.Cell>
            <Table.Cell>{product.size.join(",")}</Table.Cell>
            <Table.Cell>{product.keywords.length}</Table.Cell>
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
                  <DropdownMenu.Item asChild>
                    <Link href={`/admin/products/${product.id}/download`}>
                      Download
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <Link href={`/admin/products/${product.id}/edit`}>
                      Edit
                    </Link>
                  </DropdownMenu.Item>
                  <ActiveToggleDropdownItem
                    id={product.id}
                    isAvailableForPurchase={product.isAvailableForPurchase}
                  />
                  <DeleteDropdownItem
                    id={product.id}
                    disabled={product.isAvailableForPurchase}
                  />
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
