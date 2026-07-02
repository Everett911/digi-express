import { useState } from "react";
import Link from "next/link";
import ProfileIcon from "@/assets/images/icons/profile.svg";
import "./ProfileDropdown.css";

function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const showMenu = () => setIsOpen(true);
  const hideMenu = () => setIsOpen(false);

  return (
    <div
      className="profile-link"
      onMouseEnter={showMenu}
      onMouseLeave={hideMenu}
    >
      <ProfileIcon className="profile-icon" />

      {isOpen && (
        <div className="profile-dropdown">
          <Link className=" header-link" href="/login">
            <span className="profile-text-reg">Sign In / Register</span>
          </Link>
          <Link className=" header-link" href="/orders">
            <span className="profile-text-order">Orders</span>
          </Link>
          <p> </p>
          <Link className=" header-link" href="/orders">
            <span className="profile-text-acc">Account</span>
          </Link>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown;
