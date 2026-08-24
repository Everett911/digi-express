"use client";
import type { Route } from "next";
import Link from "next/link";
import {
  SiFacebook,
  SiInstagram,
  SiX,
  SiYoutube,
} from "@icons-pack/react-simple-icons";
import { Plus, Minus } from "lucide-react";
import styles from "./Footer.module.css";
import Logo from "@/src/assets/images/logo.png";
import Image from "next/image";
import { Activity, useState } from "react";

interface footerlinks {
  label: string;
  href: string;
}

interface footerTabs {
  title: string;
  links: footerlinks[];
}

export default function Footer() {
  const [activeTabIndex, setActiveTabIndex] = useState<number | null>(null);

  const handleTabClick = (index: number) => {
    setActiveTabIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const iconColor = "#3467cc";
  const iconSize = 20;

  return (
    <div className={styles.footerContainer}>
      {/* 1. Header Banner */}
      <div className={styles.banner}>
        <h2 className={styles.bannerText}>
          Swift transit. Zero delay. Done right.
        </h2>
      </div>

      <footer className={styles.mainFooter}>
        <div className={styles.grid}>
          <div className={styles.brandInfo}>
            <div className={styles.logoContainer}>
              <Image src={Logo} alt="Logo" className={styles.logo} />
            </div>

            <div className={styles.socials}>
              <a href="#" className={styles.socialIcon} aria-label="Facebook">
                <SiFacebook />
              </a>
              <a href="#" className={styles.socialIcon} aria-label="Twitter">
                <SiX />
              </a>
              <a href="#" className={styles.socialIcon} aria-label="YouTube">
                <SiYoutube />
              </a>
              <a href="#" className={styles.socialIcon} aria-label="Instagram">
                <SiInstagram />
              </a>
            </div>
          </div>

          {tabs.map((tab: footerTabs, index: number) => {
            const isOpen = activeTabIndex === index;
            return (
              <div key={tab.title} className={styles.columnWrapper}>
                <div className={styles.desktop}>
                  <h4 className={styles.columnTitle}>{tab.title}</h4>
                  <ul className={styles.linkList}>
                    {tab.links.map((link: footerlinks) => {
                      return (
                        <li key={link.label}>
                          <Link
                            href={link.href as Route}
                            className={styles.link}
                          >
                            {link.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className={styles.mobile}>
                  <button onClick={() => handleTabClick(index)}>
                    <h4 className={styles.columnTitle}>{tab.title}</h4>
                  </button>
                  <button onClick={() => handleTabClick(index)}>
                    <span className={styles.icon}>
                      {isOpen ? (
                        <Minus color={iconColor} size={iconSize} />
                      ) : (
                        <Plus color={iconColor} size={iconSize} />
                      )}
                    </span>
                  </button>

                  <Activity mode={isOpen ? "visible" : "hidden"}>
                    <ul className={styles.linkList}>
                      {tab.links.map((link: footerlinks) => (
                        <li key={link.label}>
                          <Link
                            href={link.href as Route}
                            className={styles.link}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Activity>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.copyright}>
          © 2026 Digi-Express. All Rights Reserved. | Privacy Policy | Terms of
          Service
        </div>
      </footer>
    </div>
  );
}

const tabs: footerTabs[] = [
  {
    title: "Men",
    links: [
      {
        label: "Personal Care",
        href: "/products?type=men,personal care",
      },
      { label: "Clothing", href: "/products?type=men,clothing" },
      { label: "Footwear", href: "/products?type=men,shoes" },
      { label: "Outdoor", href: "/products?type=men,outdoor" },
      { label: "Fitness & Wellness", href: "/products?type=men,fitness" },
    ],
  },
  {
    title: "Women",
    links: [
      {
        label: "Personal Care",
        href: "/products?type=women,personal care",
      },
      { label: "Clothing", href: "/products?type=women,clothing" },
      { label: "Footwear", href: "/products?type=women,shoes" },
      { label: "Outdoor", href: "/products?type=women,outdoor" },
      { label: "Fitness & Wellness", href: "/products?type=women,fitness" },
    ],
  },
  {
    title: "Guide and Help",
    links: [
      { label: "Create Account", href: "/auth" },
      { label: "Login", href: "/auth" },
      { label: "Orders", href: "/order" },
      { label: "Account", href: "/" },
    ],
  },
  {
    title: "Brands",
    links: [
      { label: "Nike", href: "/products?brand=nike" },
      { label: "Adidas", href: "/products?brand=adidas" },
      { label: "Zara", href: "/products?brand=zara" },
      { label: "Uniqlo", href: "/products?brand=uniqlo" },
      { label: "New Balance", href: "/products?brand=newbalance" },
    ],
  },
];
