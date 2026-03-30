import type { ApprovalCase } from "../../../game/models/types";
import { Panel } from "../../../shared/ui/Panel";

interface DepartmentScoreListProps {
  approval?: ApprovalCase;
}

export function DepartmentScoreList({ approval }: DepartmentScoreListProps) {
  return (
    <Panel title="部門別評価" subtitle="財務・リスク・ESGの温度感">
      {approval ? (
        <div className="list">
          {Object.entries(approval.departmentScores).map(([department, score]) => (
            <div key={department} className="listItem">
              <div className="splitRow">
                <strong>{department}</strong>
                <span className={score >= 70 ? "good" : score >= 55 ? "warning" : "danger"}>
                  {Math.round(score)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="emptyState">まだ稟議は提出されていません。</div>
      )}
    </Panel>
  );
}
