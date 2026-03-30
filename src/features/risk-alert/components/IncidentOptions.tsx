import type { IncidentState } from "../../../game/models/types";
import { Panel } from "../../../shared/ui/Panel";

interface IncidentOptionsProps {
  incident: IncidentState;
  onResolve: (responseId: string) => void;
}

export function IncidentOptions({ incident, onResolve }: IncidentOptionsProps) {
  return (
    <Panel title="対応オプション" subtitle="短期損失か長期構造かを選ぶ">
      <div className="list">
        {incident.responseOptions.map((option) => (
          <div key={option.id} className="listItem">
            <div className="splitRow">
              <strong>{option.label}</strong>
              <button
                className="buttonPrimary"
                onClick={() => onResolve(option.id)}
                type="button"
              >
                実行
              </button>
            </div>
            <span className="muted">
              cash -{option.cashImpact} / delay {option.delayImpact} / trust {option.trustImpact}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
