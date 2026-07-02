import { it, expect, describe, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Products } from "./Products";
import axios from "axios";
import "@testing-library/jest-dom";

vi.mock("axios");

describe("Product component", () => {
  let product: {
    id: string;
    image: string;
    name: string;
    rating: {
      stars: number;
      count: number;
    };
    priceCents: number;
    keywords: string[];
  };
  let loadCart: ReturnType<typeof vi.fn>;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    product = {
      id: "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
      image: "images/products/athletic-cotton-socks-6-pairs.jpg",
      name: "Black and Gray Athletic Cotton Socks - 6 Pairs",
      rating: {
        stars: 4.5,
        count: 87,
      },
      priceCents: 1090,
      keywords: ["socks", "sports", "apparel"],
    };

    loadCart = vi.fn();
    user = userEvent.setup();
  });

  it("displays the product details correctly", () => {
    render(<Products product={product} loadCart={loadCart} />);

    expect(
      screen.getByText("Black and Gray Athletic Cotton Socks - 6 Pairs"),
    ).toBeInTheDocument();

    expect(screen.getByText("$10.90")).toBeInTheDocument();

    expect(screen.getByTestId("product-image")).toHaveAttribute(
      "src",
      "images/products/athletic-cotton-socks-6-pairs.jpg",
    );

    expect(screen.getByTestId("product-rating-stars-image")).toHaveAttribute(
      "src",
      "images/ratings/rating-45.png",
    );

    expect(screen.getByText("87")).toBeInTheDocument();
  });

  it("adds a product to the cart", async () => {
    render(<Products product={product} loadCart={loadCart} />);

    const addToCartButton = screen.getByTestId("add-to-cart-button");
    await user.click(addToCartButton);

    expect(axios.post).toHaveBeenCalledWith("/api/cart-items", {
      productId: "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
      quantity: 1,
    });
    expect(loadCart).toHaveBeenCalled();
  });

  it("Select a Quantity", async () => {
    render(<Products product={product} loadCart={loadCart} />);

    const quantitySelector = screen.getByTestId("product-quantity-selector");
    const addToCartButton = screen.getByTestId("add-to-cart-button");
    await user.selectOptions(quantitySelector, "3");
    await user.click(addToCartButton);

    expect(quantitySelector).toHaveValue("3");
    expect(axios.post).toHaveBeenCalledWith("/api/cart-items", {
      productId: "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
      quantity: 3,
    });
    expect(loadCart).toHaveBeenCalled();
  });
});
