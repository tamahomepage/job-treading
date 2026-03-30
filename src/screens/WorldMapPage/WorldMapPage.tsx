import { Link } from "react-router-dom";
import { RegionCard } from "../../features/world-map/components/RegionCard";
import { useGameStore } from "../../game/state/gameStore";
import { routes } from "../../shared/constants/routes";
import { Panel } from "../../shared/ui/Panel";

export function WorldMapPage() {
  const game = useGameStore((state) => state.game);

  return (
    <div className="page">
      <div className="pageHeader">
        <div className="stack" style={{ gap: 6 }}>
          <h1 className="pageTitle">World Map</h1>
          <p className="pageSubtitle">
            今年どこが熱いかを読み、次の情報収集先を決めます。
          </p>
        </div>
        <Link className="buttonPrimary" to={routes.intelligence}>
          情報収集へ
        </Link>
      </div>

      <div className="gridThree">
        {Object.entries(game.marketState.regionMetrics).map(([region, metrics]) => (
          <RegionCard key={region} region={region as never} metrics={metrics} />
        ))}
      </div>

      <Panel title="マクロシグナル" subtitle="市況と政策">
        <div className="splitRow">
          <div className="buttonRow">
            {game.marketState.policySignals.map((signal) => (
              <span key={signal} className="pill">
                {signal}
              </span>
            ))}
          </div>
          <div className="buttonRow">
            <span className="pill">LNG {game.marketState.commodityPrices.lng}</span>
            <span className="pill">Wheat {game.marketState.commodityPrices.wheat}</span>
            <span className="pill">USDJPY {game.marketState.fxRates.USDJPY}</span>
          </div>
        </div>
      </Panel>
    </div>
  );
}
