import styles from "./TagChip.module.css";

interface TagChipProps {
  label: string;
  tone?: "default" | "opportunity" | "risk" | "hq";
}

export function TagChip({ label, tone = "default" }: TagChipProps) {
  return <span className={`${styles.chip} ${styles[tone]}`}>{label}</span>;
}
