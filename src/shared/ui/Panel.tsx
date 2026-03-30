import type { PropsWithChildren, ReactNode } from "react";
import styles from "./Panel.module.css";

interface PanelProps extends PropsWithChildren {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export function Panel({ title, subtitle, action, children }: PanelProps) {
  return (
    <section className={styles.panel}>
      {(title || subtitle || action) && (
        <header className={styles.header}>
          <div>
            {title && <h2 className={styles.title}>{title}</h2>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
