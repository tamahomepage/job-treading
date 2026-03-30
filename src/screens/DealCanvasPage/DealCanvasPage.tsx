import { Link, useNavigate, useParams } from "react-router-dom";
import { DealSlotCard } from "../../features/deal-canvas/components/DealSlotCard";
import { selectDealCanvasView } from "../../game/selectors/dealSelectors";
import { useGameStore } from "../../game/state/gameStore";
import { routes } from "../../shared/constants/routes";
import { MetricCard } from "../../shared/ui/MetricCard";
import { Panel } from "../../shared/ui/Panel";

const orderedSlots = [
  "demand",
  "technology",
  "localPartner",
  "finance",
  "permit",
  "logistics",
  "offtake",
  "operator"
] as const;

export function DealCanvasPage() {
  const navigate = useNavigate();
  const { dealId } = useParams();
  const game = useGameStore((state) => state.game);
  const masterData = useGameStore((state) => state.masterData);
  const assignFragmentToSlot = useGameStore((state) => state.assignFragmentToSlot);
  const assignPartnerToSlot = useGameStore((state) => state.assignPartnerToSlot);
  const openNegotiation = useGameStore((state) => state.openNegotiation);
  const submitApprovalForDeal = useGameStore((state) => state.submitApprovalForDeal);

  if (!dealId) {
    return <div className="emptyState">案件IDが見つかりません。</div>;
  }

  const canvas = selectDealCanvasView(game, masterData, dealId);

  if (!canvas) {
    return (
      <div className="page">
        <div className="emptyState">案件が見つかりません。Inbox から案件化してください。</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="pageHeader">
        <div className="stack" style={{ gap: 6 }}>
          <h1 className="pageTitle">Deal Canvas</h1>
          <p className="pageSubtitle">
            不足スロットを埋め、案件の成立スコアを上げていきます。
          </p>
        </div>
        <div className="buttonRow">
          <Link className="buttonGhost" to={routes.inbox}>
            Inboxへ戻る
          </Link>
          <button
            className="buttonPrimary"
            onClick={() => {
              submitApprovalForDeal(canvas.deal.id);
              navigate(routes.approval(canvas.deal.id));
            }}
            type="button"
          >
            稟議へ進む
          </button>
        </div>
      </div>

      <div className="metricRow">
        <MetricCard
          label="Structure Score"
          value={Math.round(canvas.view.structureScore)}
          tone={canvas.view.structureScore >= 70 ? "good" : "warn"}
        />
        <MetricCard
          label="Approval Preview"
          value={Math.round(canvas.view.approvalPreview)}
          tone={canvas.view.approvalPreview >= 70 ? "good" : "warn"}
        />
        <MetricCard label="IRR" value={`${canvas.deal.expectedIrr.toFixed(1)}%`} />
        <MetricCard label="Equity" value={Math.round(canvas.deal.equityRequired)} />
      </div>

      <div className="gridTwo">
        <Panel title={canvas.deal.name} subtitle="案件の中核条件">
          <div className="stack">
            <span className="muted">
              unresolved risks:{" "}
              {canvas.view.unresolvedRisks.length > 0
                ? canvas.view.unresolvedRisks.join(" / ")
                : "none"}
            </span>
            <span className="muted">
              synergy:{" "}
              {canvas.view.synergyPreview.length > 0
                ? canvas.view.synergyPreview.join(" / ")
                : "まだなし"}
            </span>
            <div className="list">
              {canvas.leadFragments.map((fragment) => (
                <div key={fragment.id} className="listItem">
                  <strong>{fragment.title}</strong>
                  <span className="muted">{fragment.tags.join(", ")}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="契約方針" subtitle="MVPでは固定値で開始">
          <div className="list">
            <div className="listItem">
              <strong>Player Equity Share</strong>
              <span className="muted">{canvas.deal.contractTerms.equitySharePlayer}%</span>
            </div>
            <div className="listItem">
              <strong>Control Level</strong>
              <span className="muted">{canvas.deal.contractTerms.controlLevel}</span>
            </div>
            <div className="listItem">
              <strong>ESG Budget</strong>
              <span className="muted">{canvas.deal.contractTerms.esgMitigationBudget}</span>
            </div>
          </div>
        </Panel>
      </div>

      <div className="cardGrid">
        {orderedSlots.map((slotId) => {
          const current = canvas.deal.slotAssignments[slotId];
          const suggestions = canvas.slotSuggestions[slotId];

          return (
            <DealSlotCard
              key={slotId}
              slotId={slotId}
              assignmentLabel={current ? `${current.kind}: ${current.refId}` : undefined}
              fragmentSuggestions={suggestions.fragments.map((fragment) => ({
                id: fragment.id,
                title: fragment.title
              }))}
              partnerSuggestions={suggestions.partners.map((partner) => ({
                id: partner.id,
                name: partner.name
              }))}
              onAssignFragment={(fragmentId) =>
                assignFragmentToSlot(canvas.deal.id, slotId, fragmentId)
              }
              onAssignPartner={(partnerId) =>
                assignPartnerToSlot(canvas.deal.id, slotId, partnerId)
              }
              onNegotiate={(partnerId) => {
                const sessionId = openNegotiation(canvas.deal.id, partnerId, slotId);
                navigate(routes.negotiation(sessionId));
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
