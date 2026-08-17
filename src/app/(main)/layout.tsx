import type { Metadata } from "next";
import { getCartFromSession } from "@/lib/db/cart";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Header } from "@/src/components/Header/Header";

export const metadata: Metadata = {
  title: "Digi-Express",
  description: "Ecommerce Project",
  icons: {
    icon: "/website-logo.png",
  },
};

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const cart = await getCartFromSession();
  const totalQuantity =
    cart?.reduce((acc, item) => acc + item.quantity, 0) ?? 0;
  return (
    <>
      <Header session={session} totalQuantity={totalQuantity} />
      {children}
    </>
  );
}
