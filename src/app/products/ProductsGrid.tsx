import type { Product } from "../../schemas/products";
import { Products } from "./Products";

type Props = {
  products: Product[];
  loadCart: () => Promise<void>;
};

export function ProductsGrid({ products, loadCart }: Props) {
  return (
    <div className="products-grid">
      {products.map((product) => {
        return (
          <Products key={product.id} product={product} loadCart={loadCart} />
        );
      })}
    </div>
  );
}
