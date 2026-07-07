import { useState } from "react";
import Link from "next/link";
import ProfileIcon from "@/assets/images/icons/profile.svg";
import "./ProfileDropdown.css";
import { signOut } from "../../lib/actions/auth-actions";
import { useRouter } from "next/navigation";

function ProfileDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const showMenu = () => setIsOpen(true);
  const hideMenu = () => setIsOpen(false);
  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };
  return (
    <div
      className="profile-link"
      onMouseEnter={showMenu}
      onMouseLeave={hideMenu}
    >
      <ProfileIcon className="profile-icon" />

      {isOpen && (
        <div className="profile-dropdown">
          <Link className=" header-link" href="/auth">
            <span className="profile-text-reg">Sign In / Register</span>
          </Link>
          <Link className=" header-link" href="/orders">
            <span className="profile-text-order">Orders</span>
          </Link>
          <p> </p>
          <Link className=" header-link" href="/orders">
            <span className="profile-text-acc">Account</span>
          </Link>
          <button onClick={handleSignOut} className="profile-text-acc">
            SignOut
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown;
