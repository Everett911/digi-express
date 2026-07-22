import Image from "next/image";
import Deal from "@/assets/images/Deal.png";
import Gift from "@/assets/images/Gift.png";

import styles from "./DealSection.module.css";

function DealSection() {
  return (
    <div className={styles.section}>
      <span className={styles.text}>Featured Deals</span>
      <div className={styles.container}>
        <div className={styles.leftWrapper}>
          <Image
            src={Deal}
            alt="Exclusive Deals Image"
            className={styles.leftImg}
          />
          <button className={styles.leftButton}>Shop Now</button>
        </div>
        <div className={styles.rightWrapper}>
          <Image
            src={Gift}
            alt="Welcome Gift Image"
            className={styles.rightImg}
          />
          <button className={styles.rightButton}>Shop Now</button>
        </div>
      </div>
    </div>
  );
}

export default DealSection;
