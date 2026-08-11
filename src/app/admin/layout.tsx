import { Nav, NavLink } from "@/components/Nav/Nav";
import styles from "./page.module.css";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.role !== "admin") {
    redirect("/auth");
  }
  return (
    <>
      <Nav>
        <NavLink href="/admin">Dashboard</NavLink>
        <NavLink href="/admin/products">Products</NavLink>
        <NavLink href="/admin/users">Customers</NavLink>
        <NavLink href="/admin/sales">Sales</NavLink>
      </Nav>
      <Theme accentColor="blue">
        <div className={styles.container}>{children}</div>
      </Theme>
    </>
  );
}
