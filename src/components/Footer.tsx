import Link from "next/link";
import "./Footer.css";
import { useState } from "react";
import Chevron from "@/assets/images/icons/chevron.svg";
import Logo from "@/assets/images/logo.png";
import Image from "next/image";

function Footer() {
  const [activeQuestion, setActiveQuestion] = useState<boolean>(false);
  const toggleMenuQuestion = () => setActiveQuestion((prev) => !prev);
  const [activeShop, setActiveShop] = useState<boolean>(false);
  const toggleMenuShop = () => setActiveShop((prev) => !prev);
  return (
    <>
      <div className="footer-container">
        <div className="top-section">
          <div className="help-section">
            <span className="footer-title-link">Questions</span>
            {helps.map((item) => (
              <Link className="navlink-text" href="/" key={item}>
                <span>{item}</span>
              </Link>
            ))}
          </div>
          <div className="help-section-mobile">
            <div className="toggle-container">
              <button
                className="toggle-menu-button-footer"
                onClick={toggleMenuQuestion}
              >
                QUESTION
              </button>
              {activeQuestion === true ? (
                <Chevron
                  className="chevron-icon"
                  style={{
                    width: "24px",
                    height: "36px",
                    margin: "0px 10px 0px 0px",
                    filter: "invert(100%)",
                  }}
                />
              ) : (
                <Chevron
                  className="chevron-icon"
                  style={{
                    transform: "rotate(180deg)",
                    transformOrigin: "center",
                    width: "24px",
                    height: "36px",
                    margin: "0px 10px 0px 0px",
                    filter: "invert(100%)",
                  }}
                />
              )}
            </div>
            {activeQuestion &&
              helps.map((item) => (
                <Link className="navlink-text" href="/" key={item}>
                  <span>{item}</span>
                </Link>
              ))}
          </div>
          <div className="shop-section">
            <span className="footer-title-link">Shop</span>
            {categories.map((item) => (
              <Link
                className="navlink-text"
                href={`/product/?search=${item}`}
                key={item}
              >
                <span>{item}</span>
              </Link>
            ))}
          </div>
          <div className="shop-section-mobile">
            <div className="toggle-container">
              <button
                className="toggle-menu-button-footer"
                onClick={toggleMenuShop}
              >
                SHOP
              </button>
              {activeShop === true ? (
                <Chevron
                  className="chevron-icon"
                  style={{
                    width: "24px",
                    height: "36px",
                    margin: "0px 10px 0px 0px",
                    filter: "invert(100%)",
                  }}
                />
              ) : (
                <Chevron
                  className="chevron-icon"
                  style={{
                    transform: "rotate(180deg)",
                    transformOrigin: "center",
                    width: "24px",
                    height: "36px",
                    margin: "0px 10px 0px 0px",
                    filter: "invert(100%)",
                  }}
                />
              )}
            </div>
            {activeShop &&
              categories.map((item) => (
                <Link
                  className="navlink-text"
                  href={`/product/?search=${item}`}
                  key={item}
                >
                  <span>{item}</span>
                </Link>
              ))}
          </div>
          <div className="subscribe-section">
            <span className="subscribe-text">
              Subscribe to get our latest trends
            </span>
            <input className="input-subscribe" type="email" />
            <label>
              <input
                type="checkbox"
                id="terms"
                name="agreement"
                value="accepted"
              />
              <span className="term-text">
                By proceeding, you affirm that you read and agree to
              </span>
              <Link className="navlink-text" href="/">
                Privacy Notice
              </Link>
            </label>
            <button className="subscribe-button">Subscribe</button>
          </div>
        </div>
        <div className="bottom-section">
          <Image className="footer-logo" src={Logo} alt="logo" />
          <span className="footer-bottom-font">
            © 2026 DigiExpress, Inc. All Rights Reserved.
          </span>
        </div>
      </div>
    </>
  );
}

export default Footer;

const categories = [
  "Men",
  "Women",
  "Toddler",
  "Electronics",
  "Appliances",
  "Beauty",
  "Outdoors",
];

const helps = [
  "Returns",
  "FAQ",
  "Terms and Conditions",
  "Privacy Policy",
  "Order History",
  "How To Track Your Order",
  "Size Chart",
];
