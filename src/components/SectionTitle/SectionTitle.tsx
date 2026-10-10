import { ReactNode } from "react";
import styles from "./SectionTitle.module.css";

interface SectionTitleProps {
  children: ReactNode;
  id?: string;
}

// Shared heading for homepage sections so every title lines up the same way.
function SectionTitle({ children, id }: SectionTitleProps) {
  return (
    <h2 id={id} className={styles.title}>
      {children}
    </h2>
  );
}

export default SectionTitle;
