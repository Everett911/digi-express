import styles from "./Button.module.css";

interface ColorButtonProps {
  col: string;
  isActive: boolean;
  onClick?: () => void;
}

function ColorButton({ col, isActive, onClick }: ColorButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.colorButton} ${isActive ? styles.active : ""}`.trim()}
      style={{ backgroundColor: col }}
      aria-label={`Select color ${col}`}
      aria-pressed={isActive}
    />
  );
}

export default ColorButton;
