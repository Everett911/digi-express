"use client"; // Required in Next.js App Router for state hooks

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import Chevron from "@/assets/images/icons/chevron.svg";
import Logo from "@/assets/images/logo.png";
import styles from "./Footer.module.css"; // Next.js scoped CSS module import

interface AccordionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

// Reusable Sub-component to eliminate duplicate markup
const FooterAccordion = ({
  title,
  isOpen,
  onToggle,
  children,
}: AccordionProps) => (
  <div className={styles.sectionWrapper}>
    {/* Mobile Toggle Button */}
    <button className={styles.mobileToggleButton} onClick={onToggle}>
      <span>{title}</span>
      <Chevron
        className={`${styles.chevronIcon} ${isOpen ? styles.chevronOpen : ""}`}
      />
    </button>

    {/* Desktop Heading Accent */}
    <h3 className={styles.desktopHeading}>{title}</h3>

    {/* Dropdown Menu Item Area */}
    <div
      className={`${styles.linksContainer} ${isOpen ? styles.mobileVisible : ""}`}
    >
      {children}
    </div>
  </div>
);

export default function Footer() {
  const [activeQuestion, setActiveQuestion] = useState<boolean>(false);
  const [activeShop, setActiveShop] = useState<boolean>(false);

  return (
    <footer className={styles.footerContainer}>
      <div className={styles.topSection}>
        {/* Questions Accordion Column */}
        <FooterAccordion
          title="Questions"
          isOpen={activeQuestion}
          onToggle={() => setActiveQuestion(!activeQuestion)}
        >
          {helps.map((item) => (
            <Link key={item} href="/" className={styles.navLink}>
              {item}
            </Link>
          ))}
        </FooterAccordion>

        {/* Shop Accordion Column */}
        <FooterAccordion
          title="Shop"
          isOpen={activeShop}
          onToggle={() => setActiveShop(!activeShop)}
        >
          {categories.map((item) => (
            <Link
              key={item}
              href={`/product/?search=${encodeURIComponent(item)}`}
              className={styles.navLink}
            >
              {item}
            </Link>
          ))}
        </FooterAccordion>

        {/* Subscription Target Area */}
        <div className={styles.subscribeSection}>
          <h3 className={styles.desktopHeading}>
            Subscribe to get our latest trends
          </h3>
          <input
            className={styles.inputSubscribe}
            type="email"
            placeholder="Your email address"
          />

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              id="terms"
              name="agreement"
              value="accepted"
              className={styles.checkboxInput}
            />
            <span className={styles.termText}>
              By proceeding, you affirm that you read and agree to{" "}
              <Link className={styles.privacyLink} href="/">
                Privacy Notice
              </Link>
            </span>
          </label>

          <button className={styles.subscribeButton}>Subscribe</button>
        </div>
      </div>

      {/* Bottom Border Elements */}
      <div className={styles.bottomSection}>
        <Image
          className={styles.footerLogo}
          src={Logo}
          alt="DigiExpress Logo"
          width={140}
          height={32}
          priority
        />
        <span className={styles.footerBottomFont}>
          © {new Date().getFullYear()} DigiExpress, Inc. All Rights Reserved.
        </span>
      </div>
    </footer>
  );
}

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
