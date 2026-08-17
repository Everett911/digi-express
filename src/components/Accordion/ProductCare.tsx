"use client";

import { useState } from "react";
import styles from "./Accordion.module.css";
import { ChevronDown } from "lucide-react";

export default function ProductCare() {
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
        <span>Product Care</span>
        <ChevronDown
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
        />
      </button>

      <div
        className={`${styles.panelWrapper} ${isOpen ? styles.panelWrapperOpen : ""}`}
      >
        <div className={styles.panelInner}>
          <div className={styles.content}>
            <p>
              Washing: Sort laundry by color, weight, and required temperature.
              Use cold water for delicate or bright-colored garments to prevent
              fading and shrinkage. Wash dark clothing inside-out to preserve
              color.
            </p>
            <p>
              Drying: Air drying (line-dry or flat-dry) is generally safer for
              fabrics than mechanical dryers, which can cause damage through
              high heat and agitation.
            </p>
            <p>
              Ironing: Use appropriate heat settings (low for delicate fabrics
              like silk or wool) and consider using steam to avoid direct heat
              damage.
            </p>
            <p>
              Premium Fabrics: Delicate materials like wool, silk, or cashmere
              often require specialized care, such as using soft brushes for
              dust removal and avoiding aggressive detergents.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
