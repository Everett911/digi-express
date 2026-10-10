import styles from "./Button.module.css";

interface ColorButtonProps {
  col: string;
  isActive: boolean;
  onClick?: () => void;
}

// Product colors are stored as plain names. Some aren't valid CSS colors
// ("navy blue") or render differently from what shoppers expect (CSS
// "brown" is brick red), so map those to a matching shade.
const SWATCH_OVERRIDES: Record<string, string> = {
  brown: "#7b4a2d",
  navyblue: "#1f2a55",
  beige: "#d9c3a0",
  tan: "#c19a6b",
  cream: "#f3ead8",
  camel: "#c19a6b",
};

export function swatchColor(col: string) {
  const key = col.toLowerCase().replace(/[^a-z]/g, "");
  return SWATCH_OVERRIDES[key] ?? key;
}

function ColorButton({ col, isActive, onClick }: ColorButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.colorButton} ${isActive ? styles.active : ""}`.trim()}
      style={{ backgroundColor: swatchColor(col) }}
      title={col}
      aria-label={`Select color ${col}`}
      aria-pressed={isActive}
    />
  );
}

export default ColorButton;
