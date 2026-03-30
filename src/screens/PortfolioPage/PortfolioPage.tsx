import { Link } from "react-router-dom";
import { SynergySummary } from "../../features/portfolio/components/SynergySummary";
import { selectPortfolioView } from "../../game/selectors/portfolioSelectors";
import { useGameStore } from "../../game/state/gameStore";
import { routes } from "../../shared/constants/routes";
import { MetricCard } from "../../shared/ui/MetricCard";
import { Panel } from "../../shared/ui/Panel";

export function PortfolioPage() {
  const game = useGameStore((state) => state.game);
  const portfolio = selectPortfolioView(game);

  return (
    <div className="page">
      <div className="pageHeader">
        <div className="stack" style={{ gap: 6 }}>
          <h1 className="pageTitle">Portfolio</h1>
          <p className="pageSubtitle">
            単独案件ではなく、地域分散とシナジーの構造価値で見る画面です。
          </p>
        </div>
        <Link className="buttonSecondary" to={routes.yearEnd}>
          Year Endへ
        </Link>
      </div>

      <div className="metricRow">
        <MetricCard label="Corporate Value" value={Math.round(portfolio.corporateValueScore)} />
        <MetricCard label="CF Projection" value={Math.round(portfolio.cashFlowProjection)} />
        <MetricCard
          label="Concentration Risk"
          value={Math.round(portfolio.concentrationRiskScore)}
          tone={portfolio.concentrationRiskScore >= 60 ? "danger" : "warn"}
        />
      </div>

      <div className="gridTwo">
        <Panel title="保有案件" subtitle="現在のポートフォリオ">
          {game.deals.length > 0 ? (
            <div className="list">
              {game.deals.map((deal) => (
                <div key={deal.id} className="listItem">
                  <div className="splitRow">
                    <strong>{deal.name}</strong>
                    <Link className="linkButton" to={routes.deal(deal.id)}>
                      開く
                    </Link>
                  </div>
                  <span className="muted">
                    {deal.region} / {deal.industry} / {deal.stage}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="emptyState">まだ保有案件がありません。Inbox から案件化してください。</div>
          )}
        </Panel>

        <SynergySummary view={portfolio} />
      </div>
    </div>
  );
}
