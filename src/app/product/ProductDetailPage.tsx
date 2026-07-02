import { useState, useEffect, useRef } from "react";
import { NavLink, useParams } from "react-router";
import { Header } from "../../components/Header";
import MinusIcon from "../../assets/images/icons/minus.svg?react";
import PlusIcon from "../../assets/images/icons/plus.svg?react";
import axios from "axios";
import "./ProductDetailPage.css";
import { formatMoney } from "../../utils/money";
import Footer from "../../components/Footer";
import Chevron from "../../assets/images/icons/chevron.svg?react";
import Swiper from "swiper";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import Dropdown from "../../components/Dropdown";
import { Products } from "../products/Products";

type Props = {
  totalQuantity: number;
  products: {
    id: string;
    image: string;
    name: string;
    rating: {
      stars: number;
      count: number;
    };
    priceCents: number;
    keywords: string[];
  }[];
  loadCart: () => void;
};

export function ProductDetailPage({
  totalQuantity,
  products,
  loadCart,
}: Props) {
  const { productId, productKeywords } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [showcaseProduct, setShowcaseProduct] = useState<string | undefined>(
    productKeywords,
  );
  const sliderRef = useRef<HTMLDivElement>(null);
  const mainSwiperElementRef = useRef<HTMLDivElement>(null);
  const thumbSwiperElementRef = useRef<HTMLDivElement>(null);
  const previousButtonRef = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLDivElement>(null);
  const galleryThumbsRef = useRef<Swiper | null>(null);
  const galleryMainRef = useRef<Swiper | null>(null);

  const product = products.find((product) => product.id === productId);

  useEffect(() => {
    if (
      !product ||
      !mainSwiperElementRef.current ||
      !thumbSwiperElementRef.current ||
      !previousButtonRef.current ||
      !nextButtonRef.current
    ) {
      return;
    }

    galleryThumbsRef.current?.destroy(true, true);
    galleryMainRef.current?.destroy(true, true);

    const galleryThumbs = new Swiper(thumbSwiperElementRef.current, {
      modules: [FreeMode],
      spaceBetween: 12,
      slidesPerView: "auto",
      freeMode: true,
      watchSlidesProgress: true,
    });

    const galleryMain = new Swiper(mainSwiperElementRef.current, {
      modules: [Navigation, Thumbs],
      spaceBetween: 10,
      navigation: {
        nextEl: nextButtonRef.current,
        prevEl: previousButtonRef.current,
      },
      thumbs: {
        swiper: galleryThumbs,
      },
    });

    galleryThumbsRef.current = galleryThumbs;
    galleryMainRef.current = galleryMain;

    return () => {
      galleryThumbs.destroy(true, true);
      galleryMain.destroy(true, true);
      galleryThumbsRef.current = null;
      galleryMainRef.current = null;
    };
  }, [product]);

  useEffect(() => {
    setQuantity(1);
    setShowcaseProduct(productKeywords);
  }, [productId, productKeywords]);

  const activeSizeChartType =
    product?.keywords.includes("apparel") ||
    product?.keywords.includes("clothing")
      ? "clothing"
      : product?.keywords.includes("shoes")
        ? "shoes"
        : null;

  const handleDecrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrement = () => {
    if (quantity < 10) setQuantity(quantity + 1);
  };

  const addToCart = async () => {
    await axios.post("/api/cart-items", {
      productId: product?.id,
      quantity,
    });

    await loadCart();
  };

  const closeSizeChart = () => {
    setIsSizeChartOpen(false);
  };

  return (
    <>
      <Header totalQuantity={totalQuantity} />
      {products
        .filter((product) => product.id === productId)
        .map((product) => {
          return (
            <>
              <div className="product-location">
                <NavLink to="/product">
                  <span className="product-link-home">Product</span>
                </NavLink>
                <span>
                  <Chevron
                    className="chevron-icon"
                    style={{
                      transform: "rotate(270deg)",
                      transformOrigin: "center",
                      width: "20px",
                      height: "20px",

                      marginBottom: "-5px",
                    }}
                  />
                </span>
                <span>{product.name}</span>
              </div>

              <div className="product-detail-container" key={product.id}>
                <div className="product-images-container">
                  <div
                    className="swiper main-swiper"
                    ref={mainSwiperElementRef}
                  >
                    <div className="swiper-wrapper">
                      <div className="swiper-slide">
                        <img src={product.image} />
                      </div>
                      <div className="swiper-slide">
                        <img src={product.image} />
                      </div>
                      <div className="swiper-slide">
                        <img src={product.image} />
                      </div>
                    </div>

                    <div
                      className="swiper-button-prev"
                      ref={previousButtonRef}
                    ></div>
                    <div
                      className="swiper-button-next"
                      ref={nextButtonRef}
                    ></div>
                  </div>
                  <div
                    className="swiper thumb-swiper"
                    ref={thumbSwiperElementRef}
                  >
                    <div className="swiper-wrapper">
                      <div className="swiper-slide">
                        <img src={product.image} />
                      </div>
                      <div className="swiper-slide">
                        <img src={product.image} />
                      </div>
                      <div className="swiper-slide">
                        <img src={product.image} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="product-content-container">
                  <div className="product-name">{product.name}</div>
                  <div className="product-price">
                    {formatMoney(product.priceCents)}
                  </div>
                  {activeSizeChartType && (
                    <>
                      <button
                        type="button"
                        className="product-size-title"
                        onClick={() => setIsSizeChartOpen(true)}
                      >
                        {activeSizeChartType === "clothing"
                          ? "Clothing"
                          : "Shoes"}{" "}
                        Size Chart
                      </button>
                      <div className="product-title"> Size </div>
                      <div className="product-size-content">
                        <button className="size-button">XXS</button>
                        <button className="size-button">XS</button>
                        <button className="size-button">S</button>
                        <button className="size-button">M</button>
                        <button className="size-button">L</button>
                        <button className="size-button">XL</button>
                        <button className="size-button">XXL</button>
                      </div>
                    </>
                  )}

                  <div className="product-title"> Color </div>
                  <div className="product-color-content">
                    {colors.map((color) => {
                      return (
                        <button
                          className="color-button"
                          style={{ backgroundColor: color }}
                          key={color}
                        ></button>
                      );
                    })}
                  </div>

                  <div className="product-quantity-content">
                    <div className="product-title"> Quantity </div>
                    <div
                      className="product-quantity-container"
                      data-testid="product-quantity-selector"
                    >
                      <button
                        type="button"
                        onClick={handleDecrement}
                        disabled={quantity <= 1}
                        aria-label="Decrease quantity"
                        className="quantity-button-minus"
                      >
                        <MinusIcon className="quantity-icon" />
                      </button>

                      <div>
                        <span className="quantity-display">{quantity}</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleIncrement}
                        disabled={quantity >= 10}
                        aria-label="Increase quantity"
                        className="quantity-button-plus"
                      >
                        <PlusIcon className="quantity-icon" />
                      </button>
                    </div>
                    <div className="product-addtocart-content">
                      <button
                        className="add-to-cart-button"
                        onClick={addToCart}
                      >
                        Add to Cart
                      </button>
                    </div>
                    {dropdowns.map((dropdown) => {
                      return (
                        <Dropdown
                          title={dropdown.title}
                          context={dropdown.context}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="showcase-container">
                <div className="title-link">
                  <button
                    className="showcase-button"
                    onClick={() => setShowcaseProduct(product.keywords[0])}
                  >
                    Suggestions
                  </button>
                </div>
                <div className="showcase-product-container">
                  <div className="products-grid" ref={sliderRef}>
                    {products
                      .filter((suggestedProduct) => {
                        const activeKeyword = product.keywords.includes(
                          showcaseProduct ?? "",
                        )
                          ? showcaseProduct
                          : product.keywords[0];

                        return suggestedProduct.keywords.includes(
                          activeKeyword ?? "",
                        );
                      })
                      .slice(0, 5)
                      .map((suggestedProduct) => (
                        <Products
                          key={suggestedProduct.id}
                          product={suggestedProduct}
                        />
                      ))}
                  </div>
                </div>
              </div>
            </>
          );
        })}
      {isSizeChartOpen && (
        <div className="size-chart-overlay" onClick={closeSizeChart}>
          <button
            type="button"
            className="size-chart-close"
            onClick={closeSizeChart}
          >
            x
          </button>
          <img
            className="size-chart-image"
            src={`/images/${
              activeSizeChartType === "clothing" ? "clothing" : "shoes"
            }-size-chart.png`}
            alt="Clothing size chart"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}

      <Footer />
    </>
  );
}

const colors = ["white", "gray", "black", "yellow", "blue", "red"];

const dropdowns = [
  {
    title: "Description",
    context:
      "Introducing the ultimate solution designed to elevate your daily routine and deliver exceptional results. Crafted with premium quality materials, this versatile product seamlessly blends high-performance functionality with a sleek, modern aesthetic. Whether you are looking to maximize efficiency, upgrade your current setup, or find the perfect gift, this retail essential is engineered to exceed expectations.",
  },
  {
    title: "Care Guide",
    context:
      "Proper care and maintenance ensure your item remains in peak condition and delivers optimal performance for years to come. Follow these universal guidelines to protect your investment and extend its lifespan.General MaintenanceClean Regularly: Wipe surfaces with a soft, dry microfiber cloth to remove dust.Avoid Moisture: Keep away from direct water, high humidity, and liquids unless specified.Store Safely: Keep in a cool, dry place away from direct sunlight.Handle Gently: Avoid dropping, excessive force, or rough handling during daily use.Inspect Often: Check periodically for loose parts, wear, or debris accumulation.Cleaning InstructionsPower Down: Disconnect from any power source or remove batteries if applicable.Clear Debris: Gently brush away loose dirt using a soft-bristled brush.Damp Wipe: Use a slightly damp cloth with mild soap for stubborn stains.Dry Fully: Allow the item to air-dry completely before using it again.",
  },
];
