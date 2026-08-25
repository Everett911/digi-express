"use client";

import { useState, useRef, useEffect, KeyboardEvent, Activity } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { User, CircleUser } from "lucide-react";
import styles from "./ProfileDropdown.module.css";
import { truncateString } from "@/src/utils/truncatestring";

type Session = typeof authClient.$Infer.Session;
type ExtendedUser = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
  role: "admin" | "customer" | string; // ✅ Forcefully inject the role attribute here
};

// 2. Override the inferred type shape
interface ProfileDropdownProps {
  session: {
    user: ExtendedUser;
    session: Session | null;
  } | null;
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
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          setIsOpen(false);
          router.push("/auth");
          router.refresh();
        },
      },
    });
  };

  return (
    <div
      className={styles.container}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
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
                href="/order"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                Orders
              </Link>
              <Link
                className={styles.item}
                href="/"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                Account
              </Link>
              <Activity
                mode={session?.user.role === "admin" ? "visible" : "hidden"}
              >
                <Link className={styles.item} role="menuitem" href={"/admin"}>
                  Admin
                </Link>
              </Activity>
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
