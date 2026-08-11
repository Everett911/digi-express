import { Loader2 } from "lucide-react";
import styles from "./loading.module.css";

export default function AdminLoading() {
  return (
    <div className={styles.container}>
      <Loader2 className={styles.loadingIcon} />
    </div>
  );
}
