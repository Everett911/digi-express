import { Nav, NavLink } from "@/src/components/Nav/Nav";
import styles from "./page.module.css";
import { Theme } from "@radix-ui/themes";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
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
        <Link href={"/"}>
          <Image
            src={"/logo.png"}
            alt="header logo"
            height={50}
            width={150}
            style={{ objectFit: "contain" }}
            className={styles.imgLogo}
          />
        </Link>
        <div>
          <NavLink href="/admin">Dashboard</NavLink>
          <NavLink href="/admin/products">Products</NavLink>
          <NavLink href="/admin/users">Customers</NavLink>
          <NavLink href="/admin/orders">Sales</NavLink>
        </div>
      </Nav>
      <Theme accentColor="blue">
        <div className={styles.container}>{children}</div>
      </Theme>
    </>
  );
}
