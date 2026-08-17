import styles from "./Button.module.css";
import React, { ReactNode } from "react";

export default function SizeButton({
  isActive,
  onClick,
  children,
}: {
  isActive: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`${styles.sizeButton} ${isActive ? styles.active : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
