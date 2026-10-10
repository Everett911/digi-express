"use client";
import { useEffect, useRef } from "react";

// Pixels the pointer must move before a press counts as a drag instead of a click.
const DRAG_THRESHOLD = 5;

/**
 * Click-and-drag horizontal scrolling for mouse users.
 * Touch and pen keep the browser's native swipe scrolling.
 * Clicks on links/buttons inside still work, but a click that ends a drag is swallowed.
 */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isPressed = false;
    let hasDragged = false;
    let startX = 0;
    let startScrollLeft = 0;

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      isPressed = true;
      hasDragged = false;
      startX = e.clientX;
      startScrollLeft = el.scrollLeft;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isPressed) return;
      const deltaX = e.clientX - startX;

      if (!hasDragged) {
        if (Math.abs(deltaX) < DRAG_THRESHOLD) return;
        hasDragged = true;
        el.dataset.dragging = "true";
      }

      e.preventDefault();
      el.scrollLeft = startScrollLeft - deltaX;
    };

    const handlePointerUp = () => {
      if (!isPressed) return;
      isPressed = false;
      delete el.dataset.dragging;
    };

    // Capture phase so this runs before the card's Link handles the click.
    const handleClick = (e: MouseEvent) => {
      if (!hasDragged) return;
      e.preventDefault();
      e.stopPropagation();
      hasDragged = false;
    };

    // Stops the browser's native link/image drag from taking over the gesture.
    const handleDragStart = (e: DragEvent) => e.preventDefault();

    el.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    el.addEventListener("click", handleClick, true);
    el.addEventListener("dragstart", handleDragStart);

    return () => {
      el.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      el.removeEventListener("click", handleClick, true);
      el.removeEventListener("dragstart", handleDragStart);
    };
  }, []);

  return ref;
}
