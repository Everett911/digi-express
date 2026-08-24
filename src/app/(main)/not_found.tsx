import Footer from "@/src/components/Footer/Footer";
import { Header } from "@/src/components/Header/Header";
import "./not_found.module.css";

export function NotFoundPage({ totalQuantity }: { totalQuantity: string }) {
  return (
    <>
      <title>404 Page Not Found</title>
      <link rel="icon" type="image/svg+xml" href="home-favicon.png" />

      <div className="not-found-message">Page not found</div>
      <Footer />
    </>
  );
}
