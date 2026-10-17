import Link from "next/link";
import Footer from "@/src/components/Footer/Footer";
import StatusPage, { statusActionClass } from "@/src/components/StatusPage/StatusPage";

export default function NotFound() {
  return (
    <>
      <title>Page not found | Digi-Express</title>
      <StatusPage
        code="404"
        title="Page not found"
        message="The page you're looking for doesn't exist or may have moved."
        action={
          <Link href="/products" className={statusActionClass}>
            Browse products
          </Link>
        }
      />
      <Footer />
    </>
  );
}
