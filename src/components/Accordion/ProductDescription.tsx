"use client";

import { useState } from "react";
import styles from "./Accordion.module.css";
import { ChevronDown } from "lucide-react";

export default function ProductDescription({
  description,
}: {
  description: string;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.container}>
      <button
        onClick={toggleAccordion}
        className={styles.trigger}
        aria-expanded={isOpen}
        type="button"
      >
        <span>Description</span>
        <ChevronDown
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
        />
      </button>

      <div
        className={`${styles.panelWrapper} ${isOpen ? styles.panelWrapperOpen : ""}`}
      >
        <div className={styles.panelInner}>
          <div className={styles.content}>{description}</div>
        </div>
      </div>
    </div>
  );
}
