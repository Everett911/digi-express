"use client";

import Image from "next/image";
import Delivery from "@/src/assets/images/Delivery.png";
import Appliances from "@/src/assets/images/Appliances.png";
import Tech from "@/src/assets/images/Tech.png";
import styles from "./CollectionSection.module.css";

export default function CollectionSection() {
  return (
    <div className={styles.collectionSection}>
      <div className={styles.collectionContainer}>
        <div className={styles.columnLeft}>
          <div className={styles.topWrapper}>
            <Image
              src={Appliances}
              alt="Appliances Card"
              className={styles.appImage}
            />
            <button className={styles.appButton}>Shop Now</button>
          </div>
          <div className={styles.bottomWrapper}>
            <Image src={Tech} alt="Tech Card" className={styles.techImage} />
            <button className={styles.techButton}>Shop Now</button>
          </div>
        </div>
        <div className={styles.columnRight}>
          <div className={styles.rightWrapper}>
            <Image
              src={Delivery}
              alt="Delivery Card"
              className={styles.deliverImage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
