import { Panel } from "../../../shared/ui/Panel";

interface YearSummaryCardProps {
  revenueProxy: number;
  corporateValueScore: number;
  onChooseFocus: (focus: "network" | "capital_efficiency" | "esg_recovery") => void;
  onAdvanceYear: () => void;
}

export function YearSummaryCard({
  revenueProxy,
  corporateValueScore,
  onChooseFocus,
  onAdvanceYear
}: YearSummaryCardProps) {
  return (
    <Panel title="決算レビュー" subtitle="来期テーマを決める">
      <div className="metricRow">
        <div className="pill">営業CF見込み {Math.round(revenueProxy)}</div>
        <div className="pill">企業価値 {Math.round(corporateValueScore)}</div>
      </div>
      <div className="buttonRow">
        <button
          className="buttonGhost"
          onClick={() => onChooseFocus("network")}
          type="button"
        >
          Network
        </button>
        <button
          className="buttonGhost"
          onClick={() => onChooseFocus("capital_efficiency")}
          type="button"
        >
          Capital Efficiency
        </button>
        <button
          className="buttonGhost"
          onClick={() => onChooseFocus("esg_recovery")}
          type="button"
        >
          ESG Recovery
        </button>
      </div>
      <button className="buttonPrimary" onClick={onAdvanceYear} type="button">
        次年度へ進む
      </button>
    </Panel>
  );
}
