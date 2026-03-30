import type { DealSlotId } from "../../../game/models/types";
import { Panel } from "../../../shared/ui/Panel";

interface DealSlotCardProps {
  slotId: DealSlotId;
  assignmentLabel?: string;
  fragmentSuggestions: Array<{ id: string; title: string }>;
  partnerSuggestions: Array<{ id: string; name: string }>;
  onAssignFragment: (fragmentId: string) => void;
  onAssignPartner: (partnerId: string) => void;
  onNegotiate?: (partnerId: string) => void;
}

export function DealSlotCard({
  slotId,
  assignmentLabel,
  fragmentSuggestions,
  partnerSuggestions,
  onAssignFragment,
  onAssignPartner,
  onNegotiate
}: DealSlotCardProps) {
  return (
    <Panel title={slotId} subtitle={assignmentLabel ?? "未設定"}>
      <div className="stack">
        {fragmentSuggestions.length > 0 ? (
          <div className="stack">
            <span className="muted">Fragment</span>
            {fragmentSuggestions.slice(0, 2).map((fragment) => (
              <div key={fragment.id} className="splitRow">
                <span>{fragment.title}</span>
                <button
                  className="buttonGhost"
                  onClick={() => onAssignFragment(fragment.id)}
                  type="button"
                >
                  反映
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {partnerSuggestions.length > 0 ? (
          <div className="stack">
            <span className="muted">Partner</span>
            {partnerSuggestions.slice(0, 2).map((partner) => (
              <div key={partner.id} className="splitRow">
                <span>{partner.name}</span>
                <div className="buttonRow">
                  <button
                    className="buttonGhost"
                    onClick={() => onAssignPartner(partner.id)}
                    type="button"
                  >
                    直割当
                  </button>
                  {onNegotiate ? (
                    <button
                      className="buttonSecondary"
                      onClick={() => onNegotiate(partner.id)}
                      type="button"
                    >
                      交渉
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </Panel>
  );
}
