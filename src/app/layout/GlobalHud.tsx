import { MetricCard } from "../../shared/ui/MetricCard";
import { useGameStore } from "../../game/state/gameStore";
import { selectHudMetrics } from "../../game/selectors/playerSelectors";

export function GlobalHud() {
  const metrics = useGameStore((state) => selectHudMetrics(state.game));

  return (
    <div className="metricRow">
      <MetricCard label="Turn" value={`${metrics.turn}`} note={`${metrics.year}年`} />
      <MetricCard label="Phase" value={metrics.phaseLabel} />
      <MetricCard label="Cash" value={metrics.cash} note="運転資金" />
      <MetricCard
        label="Invest"
        value={metrics.investmentCapacity}
        note="新規投資余力"
      />
      <MetricCard label="HQ" value={metrics.hqReputation} note="社内評価" />
      <MetricCard label="ESG" value={metrics.esgScore} note="対外信認" />
    </div>
  );
}
