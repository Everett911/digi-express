"use client";

import { useState } from "react";
import styles from "./Accordion.module.css";
import { ChevronDown } from "lucide-react";

// Descriptions are written as paragraphs like "Material: Usually spun...".
// Split each into its label and text so the label can stand out.
function parseDescription(description: string) {
  return description
    .split(/\r?\n\s*\r?\n|\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => {
      const match = paragraph.match(/^([^:.]{1,40}):\s*([\s\S]+)$/);
      return match
        ? { label: match[1], text: match[2] }
        : { label: null, text: paragraph };
    });
}

export default function ProductDescription({
  description,
}: {
  description: string;
}) {
  // Open by default: the description is the main thing customers read.
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  const paragraphs = parseDescription(description);

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
          <div className={styles.content}>
            {paragraphs.length === 0 ? (
              <p>No description for this product yet.</p>
            ) : (
              paragraphs.map((paragraph, index) =>
                paragraph.label ? (
                  <p key={index} className={styles.descriptionItem}>
                    <strong className={styles.descriptionLabel}>
                      {paragraph.label}
                    </strong>
                    {paragraph.text}
                  </p>
                ) : (
                  <p key={index} className={styles.descriptionItem}>
                    {paragraph.text}
                  </p>
                ),
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
