import type { ReactNode } from "react";
import styles from "./StatusPage.module.css";

// Full-page message used by the 404 and error pages.
export default function StatusPage({
  code,
  title,
  message,
  action,
}: {
  code: string;
  title: string;
  message: string;
  action: ReactNode;
}) {
  return (
    <main className={styles.page}>
      <p className={styles.code}>{code}</p>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.message}>{message}</p>
      {action}
    </main>
  );
}

export const statusActionClass = styles.action;
