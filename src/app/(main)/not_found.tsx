import Footer from "../../components/Footer/Footer";
import { Header } from "../../components/Header/Header";
import "./not_found.module.css";

export function NotFoundPage({ totalQuantity }: { totalQuantity: string }) {
  return (
    <>
      {/* You can choose whatever title and favicon you want. */}
      <title>404 Page Not Found</title>
      <link rel="icon" type="image/svg+xml" href="home-favicon.png" />

      {/* Remember to add the <Header> so it looks like it's
      on the same website. */}
      <Header totalQuantity={totalQuantity} />

      {/* You can style this message however you want. */}
      <div className="not-found-message">Page not found</div>
      <Footer />
    </>
  );
}
