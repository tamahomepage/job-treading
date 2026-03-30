import { Link } from "react-router-dom";
import { StaffAllocationPanel } from "../../features/intelligence/components/StaffAllocationPanel";
import { useGameStore } from "../../game/state/gameStore";
import { routes } from "../../shared/constants/routes";
import { Panel } from "../../shared/ui/Panel";

export function IntelligencePage() {
  const player = useGameStore((state) => state.game.player);
  const fragments = useGameStore((state) => state.game.fragments);
  const runIntelligenceSweep = useGameStore((state) => state.runIntelligenceSweep);

  return (
    <div className="page">
      <div className="pageHeader">
        <div className="stack" style={{ gap: 6 }}>
          <h1 className="pageTitle">Intelligence</h1>
          <p className="pageSubtitle">
            人材を張って案件化の元になる断片情報を増やします。
          </p>
        </div>
        <Link className="buttonSecondary" to={routes.inbox}>
          Inboxを見る
        </Link>
      </div>

      <div className="gridTwo">
        <StaffAllocationPanel player={player} onCollect={runIntelligenceSweep} />
        <Panel title="最新の断片情報" subtitle="情報収集後に案件化へ回す">
          <div className="list">
            {fragments.slice(-5).map((fragment) => (
              <div key={fragment.id} className="listItem">
                <strong>{fragment.title}</strong>
                <span className="muted">{fragment.tags.join(", ")}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
