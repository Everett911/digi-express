"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "../../../lib/actions/auth-actions";
import { auth } from "../../../lib/auth";
import { User, CircleUser } from "lucide-react";
import styles from "./ProfileDropdown.module.css";
import { truncateString } from "@/utils/truncatestring";

type Session = typeof auth.$Infer.Session;

interface ProfileDropdownProps {
  session: Session | null;
}

export default function ProfileDropdown({ session }: ProfileDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    router.push("/auth");
  };

  return (
    <div
      className={styles.container}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        className={styles.trigger}
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={session ? "Open user menu" : "Open auth menu"}
        type="button"
      >
        {!session ? (
          <User size={23} color="#3467cc" className={styles.icon} />
        ) : (
          <CircleUser size={25} color="#3467cc" className={styles.icon} />
        )}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className={`${styles.menu} ${styles.open}`}
          role="menu"
          aria-labelledby="profile-trigger"
        >
          {!session ? (
            <Link
              className={styles.item}
              href="/auth"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              Sign In / Register
            </Link>
          ) : (
            <>
              <span className={styles.user}>
                {truncateString(`${session?.user.name}`, 10)}
              </span>
              <Link
                className={styles.item}
                href="/orders"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                Orders
              </Link>
              <Link
                className={styles.item}
                href="/account"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                Account
              </Link>
              <div className={styles.divider} role="separator" />
              <button
                className={styles.item}
                onClick={handleSignOut}
                role="menuitem"
                type="button"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
