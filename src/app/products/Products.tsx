import { formatMoney } from "../../utils/money";
import { type Product } from "../../schemas/products";

import { useNavigate } from "react-router";

type Props = {
  product: Product;
  loadCart?: () => Promise<void>;
};

export function Products({ product }: Props) {
  const navigate = useNavigate();
  const handleProductClick = (): void => {
    navigate(`/detail/${product.id}/${product.keywords}`);
  };

  return (
    <>
      <div
        className="product-container"
        data-testid="product-container"
        onClick={handleProductClick}
      >
        <div className="product-image-container">
          <img
            className="product-image"
            data-testid="product-image"
            src={product.image}
          />
        </div>

        <div className="product-name limit-text-to-2-lines">{product.name}</div>

        <div className="product-rating-container">
          <img
            className="product-rating-stars"
            data-testid="product-rating-stars-image"
            src={`images/ratings/rating-${product.rating.stars * 10}.png`}
          />
          <div className="product-rating-count link-primary">
            {product.rating.count}
          </div>
        </div>
        <div className="product-price">{formatMoney(product.priceCents)}</div>
        <div className="product-spacer"></div>
      </div>
    </>
  );
}
