"use client";

import { useState, useRef } from "react";
import styles from "./HeaderTabs.module.css";
import SubHeaderTabs from "./SubHeaderTabs";
import type { TabCategory } from "./types";

const TABS: TabCategory[] = ["Men", "Women", "Kids", "Homewares"];

export default function HeaderTabs() {
  const [activeTab, setActiveTab] = useState<TabCategory | "">("");
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTabClick = (tabId: TabCategory) => {
    setActiveTab((prev) => (prev === tabId ? "" : tabId));
  };

  const handleMouseLeave = () => {
    setActiveTab("");
  };

  if (!TABS.length) return null;

  return (
    <div
      className={styles.container}
      ref={containerRef}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.tabList}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`${styles.tabButton} ${isActive ? styles.activeTabButton : ""}`}
              aria-expanded={isActive}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div className={styles.tabPanel}>
        {TABS.map((tab) => (
          <div
            key={tab}
            className={
              activeTab === tab ? styles.visiblePanel : styles.hiddenPanel
            }
          >
            <SubHeaderTabs titleTab={tab} />
          </div>
        ))}
      </div>
    </div>
  );
}
