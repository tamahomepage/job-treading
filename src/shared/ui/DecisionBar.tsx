import type { ReactNode } from "react";

interface DecisionBarProps {
  left?: ReactNode;
  right?: ReactNode;
}

export function DecisionBar({ left, right }: DecisionBarProps) {
  return (
    <div className="splitRow" style={{ marginTop: 8 }}>
      <div className="buttonRow">{left}</div>
      <div className="buttonRow">{right}</div>
    </div>
  );
}
