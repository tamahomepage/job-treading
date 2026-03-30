import { useNavigate } from "react-router-dom";
import { useGameStore } from "../../game/state/gameStore";
import { routes } from "../../shared/constants/routes";
import { Panel } from "../../shared/ui/Panel";

export function TopPage() {
  const navigate = useNavigate();
  const startNewGame = useGameStore((state) => state.startNewGame);

  return (
    <div className="page">
      <Panel title="総合商社シミュレーション" subtitle="世界の断片をつなぎ、収益構造を設計する">
        <div className="gridTwo">
          <div className="stack">
            <p className="pageSubtitle">
              このプロトタイプでは、断片情報を集めて案件リードを作り、Deal
              Canvasで条件を埋め、交渉と稟議で事業化していきます。
            </p>
            <div className="buttonRow">
              <button
                className="buttonPrimary"
                onClick={() => {
                  startNewGame();
                  navigate(routes.map);
                }}
                type="button"
              >
                新規ゲーム開始
              </button>
              <button
                className="buttonSecondary"
                onClick={() => navigate(routes.map)}
                type="button"
              >
                続きから見る
              </button>
            </div>
          </div>
          <div className="stack">
            <div className="pill">1. 情勢を読む</div>
            <div className="pill">2. 断片を集める</div>
            <div className="pill">3. 案件を組み立てる</div>
            <div className="pill">4. 交渉・稟議で通す</div>
            <div className="pill">5. ポートフォリオで勝つ</div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
