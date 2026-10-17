"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import styles from "./HeaderTabs.module.css";
import SubHeaderTabs from "./SubHeaderTabs";
import type { TabCategory } from "./types";

const TABS: readonly TabCategory[] = ["Men", "Women", "Kids", "Homewares"];

// Hover intent: wait briefly before opening so sweeping the cursor across the
// header doesn't flash the menu, and give a grace period before closing.
const OPEN_DELAY_MS = 120;
const CLOSE_DELAY_MS = 200;

export default function HeaderTabs() {
  const [activeTab, setActiveTab] = useState<TabCategory | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const close = useCallback(() => {
    clearTimer();
    setActiveTab(null);
  }, [clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  // While open: Escape and clicks outside close the menu.
  useEffect(() => {
    if (!activeTab) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const focusInside = containerRef.current?.contains(document.activeElement);
      close();
      if (focusInside) tabRefs.current[TABS.indexOf(activeTab)]?.focus();
    };
    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) close();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [activeTab, close]);

  const handleTabClick = (tab: TabCategory) => {
    clearTimer();
    setActiveTab((prev) => (prev === tab ? null : tab));
  };

  const handleTabPointerEnter = (e: React.PointerEvent, tab: TabCategory) => {
    if (e.pointerType !== "mouse") return; // touch uses click only
    clearTimer();
    if (activeTab) {
      setActiveTab(tab); // already open: switch instantly
    } else {
      timerRef.current = setTimeout(() => setActiveTab(tab), OPEN_DELAY_MS);
    }
  };

  const handlePointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") clearTimer();
  };

  const handlePointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    clearTimer();
    timerRef.current = setTimeout(() => setActiveTab(null), CLOSE_DELAY_MS);
  };

  const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next: number | null = null;
    if (e.key === "ArrowRight") next = (index + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveTab(TABS[index]);
      // Wait for the panel to mount, then move focus to its first link.
      requestAnimationFrame(() => document.getElementById(panelId)?.querySelector("a")?.focus());
      return;
    }
    if (next === null) return;

    e.preventDefault();
    tabRefs.current[next]?.focus();
    if (activeTab) setActiveTab(TABS[next]);
  };

  // Close when focus leaves the whole menu (e.g. Tab past the last link).
  const handleBlur = (e: React.FocusEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node | null)) close();
  };

  return (
    <div
      className={styles.container}
      ref={containerRef}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onBlur={handleBlur}
    >
      <div className={styles.tabList}>
        {TABS.map((tab, index) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              onClick={() => handleTabClick(tab)}
              onPointerEnter={(e) => handleTabPointerEnter(e, tab)}
              onKeyDown={(e) => handleTabKeyDown(e, index)}
              className={`${styles.tabButton} ${isActive ? styles.activeTabButton : ""}`}
              aria-expanded={isActive}
              aria-controls={isActive ? panelId : undefined}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {activeTab && (
        <div className={styles.tabPanel}>
          <div id={panelId} className={styles.visiblePanel}>
            <SubHeaderTabs titleTab={activeTab} onNavigate={close} />
          </div>
        </div>
      )}
    </div>
  );
}
