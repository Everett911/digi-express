import AdminUsersHeader from "../_components/AdminUsersHeader";
import styles from "./page.module.css";
import ButtonLink from "../_components/ButtonLink";
import { DropdownMenu, Table } from "@radix-ui/themes";
import { prisma } from "@/lib/prisma";
import { CheckCircle, MoreVertical, XCircle } from "lucide-react";
import Link from "next/link";
import {
  ActiveToggleDropdownItem,
  DeleteDropdownItem,
} from "./_components/UserActions";

export default function AdminUsersPage() {
  return (
    <>
      <div className={styles.container}>
        <AdminUsersHeader>Users</AdminUsersHeader>
        <ButtonLink>Add Users</ButtonLink>
      </div>
      <UserTable />
    </>
  );
}

async function UserTable() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });
  if (users.length === 0) return <p> No users Found</p>;
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
        {users.map((user) => (
          <Table.Row key={user.id}>
            {user.isAvailableForPurchase ? (
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
            <Table.Cell>{user.name}</Table.Cell>
            <Table.Cell>{user.priceCents}</Table.Cell>
            <Table.Cell>{user.image.length}</Table.Cell>
            <Table.Cell>{user.size.join(",")}</Table.Cell>
            <Table.Cell>{user.keywords.length}</Table.Cell>
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
                    <Link href={`/admin/users/${user.id}/download`}>
                      Download
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <Link href={`/admin/users/${user.id}/edit`}>Edit</Link>
                  </DropdownMenu.Item>
                  <ActiveToggleDropdownItem
                    id={user.id}
                    isAvailableForPurchase={user.isAvailableForPurchase}
                  />
                  <DeleteDropdownItem
                    id={user.id}
                    disabled={user.isAvailableForPurchase}
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
