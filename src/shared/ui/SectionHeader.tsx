interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="stack" style={{ gap: 4 }}>
      <h3 style={{ fontSize: 16 }}>{title}</h3>
      {subtitle ? <p className="muted">{subtitle}</p> : null}
    </div>
  );
}
