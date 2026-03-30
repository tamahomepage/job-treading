import { useNavigate, useParams } from "react-router-dom";
import { IncidentOptions } from "../../features/risk-alert/components/IncidentOptions";
import { useGameStore } from "../../game/state/gameStore";
import { routes } from "../../shared/constants/routes";
import { Panel } from "../../shared/ui/Panel";

export function RiskAlertPage() {
  const navigate = useNavigate();
  const { incidentId } = useParams();
  const game = useGameStore((state) => state.game);
  const triggerDemoIncident = useGameStore((state) => state.triggerDemoIncident);
  const resolveIncident = useGameStore((state) => state.resolveIncident);
  const incident =
    game.incidents.find((entry) => entry.id === incidentId) ??
    game.incidents.find((entry) => !entry.resolved);

  return (
    <div className="page">
      <div className="pageHeader">
        <div className="stack" style={{ gap: 6 }}>
          <h1 className="pageTitle">Risk Alert</h1>
          <p className="pageSubtitle">
            リスクは罰ではなく、構造を組み替える見せ場です。
          </p>
        </div>
      </div>

      {!incident ? (
        <Panel title="未発生" subtitle="デモ用にリスクを起こせます">
          <button
            className="buttonPrimary"
            onClick={() => {
              const nextId = triggerDemoIncident();
              if (nextId) {
                navigate(routes.risk(nextId));
              }
            }}
            type="button"
          >
            デモリスクを発生
          </button>
        </Panel>
      ) : (
        <div className="gridTwo">
          <Panel title={incident.templateId} subtitle={`severity ${incident.severity}`}>
            <div className="stack">
              <span className="muted">category: {incident.category}</span>
              <span className="muted">
                impacted deals: {incident.targetDealIds.join(", ") || "none"}
              </span>
            </div>
          </Panel>
          <IncidentOptions
            incident={incident}
            onResolve={(responseId) => {
              resolveIncident(incident.id, responseId);
              navigate(routes.portfolio);
            }}
          />
        </div>
      )}
    </div>
  );
}
