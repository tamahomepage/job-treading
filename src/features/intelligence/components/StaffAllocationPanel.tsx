import type { PlayerState } from "../../../game/models/types";
import { Panel } from "../../../shared/ui/Panel";

interface StaffAllocationPanelProps {
  player: PlayerState;
  onCollect: () => void;
}

export function StaffAllocationPanel({
  player,
  onCollect
}: StaffAllocationPanelProps) {
  return (
    <Panel
      title="情報収集ボード"
      subtitle="まずは断片情報を増やして案件化の土台を作る"
      action={
        <button className="buttonPrimary" onClick={onCollect} type="button">
          情報収集を実行
        </button>
      }
    >
      <div className="list">
        {Object.entries(player.staff).map(([role, pool]) => (
          <div key={role} className="listItem">
            <div className="splitRow">
              <strong>{role}</strong>
              <span className="pill">
                {pool.assigned}/{pool.total} assigned
              </span>
            </div>
            <span className="muted">fatigue {pool.fatigue}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
