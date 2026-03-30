import styles from "./MetricCard.module.css";

interface MetricCardProps {
  label: string;
  value: string | number;
  note?: string;
  tone?: "default" | "good" | "warn" | "danger";
}

export function MetricCard({
  label,
  value,
  note,
  tone = "default"
}: MetricCardProps) {
  return (
    <article className={styles.card}>
      <span className={styles.label}>{label}</span>
      <strong className={`${styles.value} ${styles[tone]}`}>{value}</strong>
      {note && <span className={styles.note}>{note}</span>}
    </article>
  );
}
