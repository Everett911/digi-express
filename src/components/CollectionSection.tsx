"use client";

import Delivery from "@/assets/images/Delivery.svg";
import Appliances from "@/assets/images/Appliances.svg";
import Tech from "@/assets/images/Tech.svg";
import styles from "./CollectionSection.module.css";

export default function CollectionSection() {
  return (
    <div className={styles.collectionSection}>
      <div className={styles.collectionContainer}>
        <div className={styles.columnLeft}>
          <div className={styles.leftWrapper}>
            <Appliances className={styles.appImage} />
            <button className={styles.appButton}>Shop Now</button>
          </div>
          <div className={styles.leftWrapper}>
            <Tech className={styles.techImage} />
            <button className={styles.techButton}>Shop Now</button>
          </div>
        </div>
        <div className={styles.columnRight}>
          <div className={styles.rightWrapper}>
            <Delivery className={styles.deliverImage} />
          </div>
        </div>
      </div>
    </div>
  );
}
