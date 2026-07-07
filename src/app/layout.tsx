import type { Metadata } from "next";
import "./globals.css";
import { auth } from "../../lib/auth";
import { headers } from "next/headers";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Digi-Express",
  description: "Ecommerce Project",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <html lang="en">
      <body>
        <Header session={session} />
        {children}
      </body>
    </html>
  );
}
