// components/Footer.tsx
import Link from "next/link";
import {
  SiFacebook,
  SiInstagram,
  SiX,
  SiYoutube,
} from "@icons-pack/react-simple-icons";
import styles from "./Footer.module.css";
import Logo from "@/assets/images/logo.png";
import Image from "next/image";

interface footerlinks {
  label: string;
  href: string;
}

interface footerTabs {
  title: string;
  links: footerlinks[];
}

export default function Footer() {
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

          {/* Navigation Matrix */}

          {tabs.map((tab: footerTabs) => {
            return (
              <div key={tab.title} className={styles.columnWrapper}>
                <h4 className={styles.columnTitle}>{tab.title}</h4>
                <ul className={styles.linkList}>
                  {tab.links.map((link: footerlinks) => {
                    return (
                      <li key={link.label}>
                        <Link href={link.href} className={styles.link}>
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Global Copyright Line */}
        <div className={styles.copyright}>
          © 2026 Digi-Express. All Rights Reserved. | Privacy Policy | Terms of
          Service
        </div>
      </footer>
    </div>
  );
}

const tabs: footerTabs = [
  {
    title: "Men",
    links: [
      { label: "Grooming", href: "#" },
      { label: "Apparel", href: "#" },
      { label: "Footwear", href: "#" },
      { label: "Outdoor", href: "#" },
      { label: "Fitness & Wellness", href: "#" },
    ],
  },
  {
    title: "Women",
    links: [
      { label: "Personal Care", href: "#" },
      { label: "Clothing", href: "#" },
      { label: "Accessories", href: "#" },
      { label: "Footwear", href: "#" },
      { label: "Fitness & Wellness", href: "#" },
    ],
  },
  {
    title: "Guide and Help",
    links: [
      { label: "Create Account", href: "#" },
      { label: "Login", href: "#" },
      { label: "Orders", href: "#" },
      { label: "Tracking", href: "#" },
      { label: "Account", href: "#" },
    ],
  },
  {
    title: "Brands",
    links: [
      { label: "Nike", href: "#" },
      { label: "Adidas", href: "#" }, // Fixed typo "Addidas"
      { label: "Zara", href: "#" },
      { label: "Uniqlo", href: "#" },
      { label: "New Balance", href: "#" },
    ],
  },
];
