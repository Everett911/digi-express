import Deal from "@/assets/images/Deal.svg";
import Gift from "@/assets/images/Gift.svg";

import styles from "./DealSection.module.css";

function DealSection() {
  return (
    <div className={styles.section}>
      <span className={styles.text}>Featured Deals</span>
      <div className={styles.container}>
        <div className={styles.leftWrapper}>
          <Deal className={styles.leftImg} />
          <button className={styles.leftButton}>Shop Now</button>
        </div>
        <div className={styles.rightWrapper}>
          <Gift className={styles.rightImg} />
          <button className={styles.rightButton}>Shop Now</button>
        </div>
      </div>
    </div>
  );
}

export default DealSection;
