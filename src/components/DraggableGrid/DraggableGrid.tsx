"use client";
import { ReactNode } from "react";
import { useDragScroll } from "@/src/hooks/useDragScroll";
import styles from "./DraggableGrid.module.css";

interface DraggableGridProps {
  children: ReactNode;
  className?: string;
}

function DraggableGrid({ children, className }: DraggableGridProps) {
  const gridRef = useDragScroll<HTMLDivElement>();

  return (
    <div
      className={className ? `${styles.grid} ${className}` : styles.grid}
      ref={gridRef}
    >
      {children}
    </div>
  );
}

export default DraggableGrid;
