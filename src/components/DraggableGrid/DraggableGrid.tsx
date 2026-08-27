"use client";
import { useRef, useEffect, ReactNode } from "react";
import styles from "./DraggableGrid.module.css";

interface DraggableGridProps {
  children: ReactNode;
  className?: string;
}

function DraggableGrid({ children, className }: DraggableGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startX = e.clientX;
      scrollLeft = grid.scrollLeft;
      grid.style.cursor = "grabbing";
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.clientX;
      const walk = (x - startX) * 1.5;
      grid.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
      isDragging = false;
      grid.style.cursor = "grab";
    };

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      scrollLeft = grid.scrollLeft;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const x = e.touches[0].clientX;
      const walk = (x - startX) * 1.5;
      grid.scrollLeft = scrollLeft - walk;
    };

    grid.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    grid.addEventListener("touchstart", handleTouchStart, { passive: true });
    grid.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      grid.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      grid.removeEventListener("touchstart", handleTouchStart);
      grid.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <div className={className || styles.grid} ref={gridRef}>
      {children}
    </div>
  );
}

export default DraggableGrid;
