import { YearSummaryCard } from "../../features/year-end/components/YearSummaryCard";
import { selectPortfolioView } from "../../game/selectors/portfolioSelectors";
import { useGameStore } from "../../game/state/gameStore";
import { Panel } from "../../shared/ui/Panel";

export function YearEndPage() {
  const game = useGameStore((state) => state.game);
  const chooseYearlyFocus = useGameStore((state) => state.chooseYearlyFocus);
  const advanceYear = useGameStore((state) => state.advanceYear);
  const portfolio = selectPortfolioView(game);

  return (
    <div className="page">
      <div className="pageHeader">
        <div className="stack" style={{ gap: 6 }}>
          <h1 className="pageTitle">Year End</h1>
          <p className="pageSubtitle">
            今年の結果を見て、来年はどこに寄せるか決めます。
          </p>
        </div>
      </div>

      <div className="gridTwo">
        <YearSummaryCard
          revenueProxy={portfolio.cashFlowProjection}
          corporateValueScore={portfolio.corporateValueScore}
          onChooseFocus={chooseYearlyFocus}
          onAdvanceYear={advanceYear}
        />
        <Panel title="今年の総括" subtitle="構造価値の観点で振り返る">
          <div className="list">
            <div className="listItem">
              <strong>保有案件数</strong>
              <span className="muted">{game.deals.length}</span>
            </div>
            <div className="listItem">
              <strong>重点方針</strong>
              <span className="muted">{game.player.yearlyFocus ?? "未設定"}</span>
            </div>
            <div className="listItem">
              <strong>アラート件数</strong>
              <span className="muted">
                {game.incidents.filter((incident) => !incident.resolved).length}
              </span>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
