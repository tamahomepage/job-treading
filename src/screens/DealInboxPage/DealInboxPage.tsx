import { useNavigate } from "react-router-dom";
import { FragmentList } from "../../features/inbox/components/FragmentList";
import { selectLeadCandidates } from "../../game/selectors/dealSelectors";
import { useGameStore } from "../../game/state/gameStore";
import { routes } from "../../shared/constants/routes";
import { Panel } from "../../shared/ui/Panel";

export function DealInboxPage() {
  const navigate = useNavigate();
  const game = useGameStore((state) => state.game);
  const masterData = useGameStore((state) => state.masterData);
  const togglePinFragment = useGameStore((state) => state.togglePinFragment);
  const createLeadFromCandidate = useGameStore((state) => state.createLeadFromCandidate);
  const createDealFromLead = useGameStore((state) => state.createDealFromLead);
  const candidates = selectLeadCandidates(game, masterData);

  return (
    <div className="page">
      <div className="pageHeader">
        <div className="stack" style={{ gap: 6 }}>
          <h1 className="pageTitle">Deal Inbox</h1>
          <p className="pageSubtitle">
            断片情報を束ねて、案件仮説をリード化します。
          </p>
        </div>
      </div>

      <div className="gridTwo">
        <FragmentList fragments={game.fragments} onTogglePin={togglePinFragment} />

        <Panel title="案件候補" subtitle="ピン留め中の断片から自動検出">
          {candidates.length > 0 ? (
            <div className="list">
              {candidates.map((candidate) => (
                <article key={candidate.id} className="listItem">
                  <div className="splitRow">
                    <strong>{candidate.name}</strong>
                    <span className={candidate.score >= 70 ? "good" : "warning"}>
                      score {candidate.score}
                    </span>
                  </div>
                  <span className="muted">
                    missing: {candidate.missingNeeds.join(", ") || "none"}
                  </span>
                  <div className="buttonRow">
                    <button
                      className="buttonGhost"
                      onClick={() => {
                        const leadId = createLeadFromCandidate(candidate);
                        const dealId = createDealFromLead(
                          leadId,
                          candidate.candidateTemplateIds[0]
                        );
                        if (dealId) {
                          navigate(routes.deal(dealId));
                        }
                      }}
                      type="button"
                    >
                      この候補で案件化
                    </button>
                  </div>
                  <div className="stack" style={{ gap: 6 }}>
                    {candidate.rationale.map((line) => (
                      <span key={line} className="muted">
                        {line}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="emptyState">
              ピン留めした断片情報が不足しています。情報を広げるか、Need/Finance/Access
              系の断片を増やしてください。
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
