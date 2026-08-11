import { ReactNode } from "react";
import styles from "./ButtonLink.module.css";
import Link from "next/link";
import { Button } from "@radix-ui/themes";

export default function ButtonLink({ children }: { children: ReactNode }) {
  return (
    <>
      <Button className={styles.button} asChild>
        <Link href="/admin/products/new" className={styles.link}>
          {children}
        </Link>
      </Button>
    </>
  );
}
