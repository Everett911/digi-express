// components/Card.tsx
import styles from "./Card.module.css";

interface CardProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export default function Card({ title, description, children }: CardProps) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {children && <div className={styles.content}>{children}</div>}
    </div>
  );
}
