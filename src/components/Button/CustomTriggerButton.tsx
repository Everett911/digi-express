import React from "react";

export const CustomTriggerButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button">
>(({ children, ...props }, ref) => (
  <button
    ref={ref}
    {...props}
    style={{
      border: "none",
      backgroundColor: "transparent",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      ...props.style,
    }}
  >
    {children}
  </button>
));

CustomTriggerButton.displayName = "CustomTriggerButton";
