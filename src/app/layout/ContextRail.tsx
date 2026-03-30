import { Link } from "react-router-dom";
import { selectContextRailData } from "../../game/selectors/playerSelectors";
import { useGameStore } from "../../game/state/gameStore";
import { routes } from "../../shared/constants/routes";
import { Panel } from "../../shared/ui/Panel";
import { TagChip } from "../../shared/ui/TagChip";

export function ContextRail() {
  const context = useGameStore((state) => selectContextRailData(state.game));

  return (
    <div className="stack">
      <Panel title="案件レーダー" subtitle="今の全体状況">
        <div className="metricRow">
          <div className="pill">断片 {context.fragmentCount}</div>
          <div className="pill">リード {context.leadCount}</div>
          <div className="pill">案件 {context.dealCount}</div>
          <div className="pill">警報 {context.alertCount}</div>
        </div>
        <p className="muted">{context.latestMessage}</p>
      </Panel>

      <Panel title="ショートカット" subtitle="主要画面へ移動">
        <div className="buttonRow">
          <Link className="buttonGhost" to={routes.map}>
            Map
          </Link>
          <Link className="buttonGhost" to={routes.inbox}>
            Inbox
          </Link>
          <Link className="buttonGhost" to={routes.portfolio}>
            Portfolio
          </Link>
          <Link className="buttonGhost" to={routes.yearEnd}>
            Year End
          </Link>
        </div>
      </Panel>

      <Panel title="評価の見方" subtitle="このゲームで見るべき軸">
        <div className="stack">
          <TagChip label="機会" tone="opportunity" />
          <TagChip label="リスク" tone="risk" />
          <TagChip label="本社視点" tone="hq" />
        </div>
      </Panel>
    </div>
  );
}
