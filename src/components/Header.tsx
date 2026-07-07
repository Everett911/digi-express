"use client";

import { useRouter, useSearchParams } from "next/navigation";
import CartLogo from "@/assets/images/icons/cart.svg";
import SearchIcon from "@/assets/images/icons/search.svg";
import CloseIcon from "@/assets/images/icons/close.svg";
import Logo from "@/assets/images/logo.png";
import MobileLogo from "@/assets/images/mobile-logo.png";
import "./header.css";
import { useState } from "react";
import ProfileDropdown from "./ProfileDropdown";
import Hamburger from "@/assets/images/icons/hamburger.svg";
import HamburgerClose from "@/assets/images/icons/hamburger-close.svg";
import { MenuHeader } from "./MenuHeader";
import Link from "next/link";
import Image from "next/image";
import { Session } from "better-auth";
import { auth } from "../../lib/auth";

type Session = typeof auth.$Infer.Session;

export function Header({ session }: { session: Session | null }) {
  const user = session?.user;
  const [active, setActive] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const searchText = searchParams.get("search");
  const [search, setSearch] = useState(searchText || "");
  const router = useRouter();
  const [isOpen, SetIsOpen] = useState<boolean>(false);

  const toggleSeachbar = () => SetIsOpen((prev) => !prev);
  const toggleMenu = () => setActive((prev) => !prev);
  const updateSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const searchProduct = () => {
    router.push(`/products?search=${search}`);
  };
  return (
    <div className="header-container">
      {isOpen && (
        <div className="search-bar-container">
          <div className="search-bar-overlay">
            <input
              className="search-bar"
              type="text"
              placeholder="Search"
              onChange={updateSearchInput}
            />
            <button className="search-button">
              <SearchIcon className="search-icon" onClick={searchProduct} />
            </button>
            <button className="close-button" onClick={toggleSeachbar}>
              <CloseIcon className="close-icon" />
            </button>
          </div>
        </div>
      )}
      <div className="header">
        <div className="left-section">
          <Link href="/" className="header-link">
            <Image className="logo" src={Logo} alt="logo" />
            <Image className="mobile-logo" src={MobileLogo} alt="mobile-logo" />
          </Link>
        </div>
        <div className="middle-section">
          <div className="menubar-container">
            <MenuHeader active={active} />
          </div>
          <div className="toggle-containers">
            <button className="toggle-menu-button" onClick={toggleMenu}>
              {active === true ? (
                <HamburgerClose
                  style={{
                    width: "24px",
                    height: "24px",
                  }}
                />
              ) : (
                <Hamburger
                  style={{
                    transform: "rotate(360deg)",
                    transformOrigin: "center",
                    width: "24px",
                    height: "24px",
                  }}
                />
              )}
            </button>
            <button className="search-button">
              <SearchIcon className="search-icon" onClick={toggleSeachbar} />
            </button>
          </div>
        </div>

        <div className="right-section">
          <button className="search-button">
            <SearchIcon className="search-icon" onClick={toggleSeachbar} />
          </button>
          <ProfileDropdown />
          {session && <span>{user?.name}</span>}
          {session && (
            <Link className="cart-link header-link" href="/checkout">
              <div className="cart-quantity">{}</div>
              <CartLogo className="cart-icon" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
