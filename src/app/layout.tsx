import { Montserrat } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import "@radix-ui/themes/styles.css";

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
  return (
    <html lang="en" className={montserrat.variable}>
      <body className={montserrat.className}>{children}</body>
    </html>
  );
}
