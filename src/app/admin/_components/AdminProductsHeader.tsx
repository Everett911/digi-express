import type { ReactNode } from "react";
import styles from "./AdminProductsHeader.module.css";

function AdminProductsHeader({ children }: { children: ReactNode }) {
  return <h1 className={styles.text}>{children}</h1>;
}

export default AdminProductsHeader;
