"use client";

import { useState, useRef } from "react";
import styles from "./HeaderTabs.module.css";
import SubHeaderTabs from "./SubHeaderTabs";

interface TabItem {
  label: string;
}

const tabs: TabItem[] = [
  {
    label: "Men",
  },
  {
    label: "Women",
  },
  {
    label: "Appliances",
  },
];

export default function HeaderTabs() {
  const [activeTab, setActiveTab] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTabClick = (tabId: string) => {
    setActiveTab((prevActiveTab) => (prevActiveTab === tabId ? "" : tabId));
  };

  const handleMouseLeave = () => {
    setActiveTab("");
  };

  if (!tabs.length) return null;

  return (
    // Wrap everything in a container to detect mouse leaving the whole area
    <div
      className={styles.container}
      ref={containerRef}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.tabList}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.label;
          return (
            <button
              key={tab.label}
              onClick={() => handleTabClick(tab.label)}
              className={`${styles.tabButton} ${isActive ? styles.activeTabButton : ""}`}
              aria-expanded={isActive}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className={styles.tabPanel}>
        {tabs.map((tab) => (
          <div
            key={tab.label}
            className={
              activeTab === tab.label ? styles.visiblePanel : styles.hiddenPanel
            }
          >
            <SubHeaderTabs titleTab={tab.label} />
          </div>
        ))}
      </div>
    </div>
  );
}
