import { Link, useParams } from "react-router-dom";
import { DepartmentScoreList } from "../../features/approval/components/DepartmentScoreList";
import { useGameStore } from "../../game/state/gameStore";
import { routes } from "../../shared/constants/routes";
import { Panel } from "../../shared/ui/Panel";

export function ApprovalPage() {
  const { dealId } = useParams();
  const game = useGameStore((state) => state.game);
  const submitApprovalForDeal = useGameStore((state) => state.submitApprovalForDeal);
  const deal = game.deals.find((entry) => entry.id === dealId);
  const approval = game.approvals.find((entry) => entry.dealId === dealId);

  if (!dealId || !deal) {
    return <div className="emptyState">稟議対象の案件が見つかりません。</div>;
  }

  return (
    <div className="page">
      <div className="pageHeader">
        <div className="stack" style={{ gap: 6 }}>
          <h1 className="pageTitle">Approval</h1>
          <p className="pageSubtitle">
            外では通った案件を、本社の財務・リスク・ESG視点でも通します。
          </p>
        </div>
        <Link className="buttonGhost" to={routes.deal(deal.id)}>
          Dealへ戻る
        </Link>
      </div>

      <div className="gridTwo">
        <DepartmentScoreList approval={approval} />
        <Panel title={deal.name} subtitle={`stage: ${deal.stage}`}>
          <div className="stack">
            <span className="muted">structure score {Math.round(deal.structureScore)}</span>
            <span className="muted">expected IRR {deal.expectedIrr.toFixed(1)}%</span>
            <span className="muted">approval difficulty {Math.round(deal.approvalDifficulty)}</span>

            {approval?.vetoMessages.length ? (
              <div className="list">
                {approval.vetoMessages.map((message) => (
                  <div key={message} className="listItem">
                    <span className="danger">{message}</span>
                  </div>
                ))}
              </div>
            ) : null}

            {approval?.recommendedActions.length ? (
              <div className="list">
                {approval.recommendedActions.map((action) => (
                  <div key={action} className="listItem">
                    <span className="muted">{action}</span>
                  </div>
                ))}
              </div>
            ) : null}

            {!approval ? (
              <button
                className="buttonPrimary"
                onClick={() => submitApprovalForDeal(deal.id)}
                type="button"
              >
                稟議を提出
              </button>
            ) : (
              <Link className="buttonSecondary" to={routes.portfolio}>
                ポートフォリオへ
              </Link>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
