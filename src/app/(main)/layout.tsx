import { Montserrat } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

import { auth } from "../../lib/auth";
import { headers } from "next/headers";
import { Header } from "@/components/Header/Header";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-montserrat",
  display: "swap",
});
export const metadata: Metadata = {
  title: "Digi-Express",
  description: "Ecommerce Project",
  icons: {
    icon: "/website-logo.png",
  },
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
    <html lang="en" className={montserrat.variable}>
      <body className={montserrat.className}>
        <Header session={session} />
        {children}
      </body>
    </html>
  );
}
