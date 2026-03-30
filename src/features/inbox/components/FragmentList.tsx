import type { FragmentInstance } from "../../../game/models/types";
import { Panel } from "../../../shared/ui/Panel";
import { TagChip } from "../../../shared/ui/TagChip";

interface FragmentListProps {
  fragments: FragmentInstance[];
  onTogglePin: (fragmentId: string) => void;
}

export function FragmentList({ fragments, onTogglePin }: FragmentListProps) {
  return (
    <Panel title="断片情報" subtitle="ピン留めして案件仮説に寄せる">
      <div className="list">
        {fragments.map((fragment) => (
          <article key={fragment.id} className="listItem">
            <div className="splitRow">
              <strong>{fragment.title}</strong>
              <button
                className={fragment.pinned ? "buttonSecondary" : "buttonGhost"}
                onClick={() => onTogglePin(fragment.id)}
                type="button"
              >
                {fragment.pinned ? "Pinned" : "Pin"}
              </button>
            </div>
            <div className="buttonRow">
              {fragment.tags.map((tag) => (
                <TagChip
                  key={tag}
                  label={tag}
                  tone={tag === "risk" ? "risk" : tag === "finance" ? "hq" : "opportunity"}
                />
              ))}
            </div>
            <span className="muted">
              certainty {fragment.certainty} / expires {fragment.expiresIn}
            </span>
          </article>
        ))}
      </div>
    </Panel>
  );
}
