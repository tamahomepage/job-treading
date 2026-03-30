import type { PortfolioComputedView } from "../../../game/models/types";
import { Panel } from "../../../shared/ui/Panel";

interface SynergySummaryProps {
  view: PortfolioComputedView;
}

export function SynergySummary({ view }: SynergySummaryProps) {
  return (
    <Panel title="シナジー接続" subtitle="単独案件ではなく構造価値を見る">
      {view.synergyEdges.length > 0 ? (
        <div className="list">
          {view.synergyEdges.map((edge, index) => (
            <div key={`${edge.fromDealId}_${edge.toDealId}_${index}`} className="listItem">
              <strong>
                {edge.fromDealId} → {edge.toDealId}
              </strong>
              <span className="muted">
                {edge.type} / value {edge.value}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="emptyState">まだ接続シナジーは発生していません。</div>
      )}
    </Panel>
  );
}
