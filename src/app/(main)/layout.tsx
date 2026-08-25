import { auth } from "@/lib/auth";
import { getCartFromSession } from "@/lib/db/cart";
import { Header } from "@/src/components/Header/Header";
import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";
type ClientSession = typeof authClient.$Infer.Session;

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const rawSession = await auth.api.getSession({
    headers: await headers(),
  });

  const session = rawSession as ClientSession | null;

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
