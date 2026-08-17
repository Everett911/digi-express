"use client";

import { useRouter } from "next/navigation";
import styles from "./Button.module.css";
import { ChevronLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()} // 2. Triggers literal browser back action
      className={styles.backButton}
    >
      <ChevronLeft className={styles.backIcon} color="#3467cc" size="30" />
      Back
    </button>
  );
}
