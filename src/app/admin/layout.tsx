import { Nav, NavLink } from "@/src/components/Nav/Nav";
import styles from "./page.module.css";
import { Theme } from "@radix-ui/themes";
import type { Metadata } from "next";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Digi-Express",
  description: "Ecommerce Project",
  icons: {
    icon: "/website-logo.png",
  },
};

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
          <NavLink href="/admin/sales">Sales</NavLink>
        </div>
      </Nav>
      <Theme accentColor="blue">
        <div className={styles.container}>{children}</div>
      </Theme>
    </>
  );
}
