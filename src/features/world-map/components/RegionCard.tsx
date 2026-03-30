import { formatRegion } from "../../../shared/lib/formatters";
import { MetricCard } from "../../../shared/ui/MetricCard";
import { Panel } from "../../../shared/ui/Panel";
import type { RegionId, RegionMetricState } from "../../../game/models/types";

interface RegionCardProps {
  region: RegionId;
  metrics: RegionMetricState;
}

export function RegionCard({ region, metrics }: RegionCardProps) {
  return (
    <Panel title={formatRegion(region)} subtitle="地域の追い風とリスク">
      <div className="metricRow">
        <MetricCard label="Opportunity" value={metrics.opportunityScore} tone="good" />
        <MetricCard label="Risk" value={metrics.riskScore} tone="warn" />
      </div>
      <div className="splitRow">
        <span className="pill">Permit {metrics.permitTightness}</span>
        <span className="pill">Sentiment {metrics.publicSentiment}</span>
      </div>
    </Panel>
  );
}
