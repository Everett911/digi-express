import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCartFromSession } from "@/lib/db/cart";
import { Header } from "@/src/components/Header/Header";
import { headers } from "next/headers";

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
