# 総合商社シミュレーション Webアプリ技術構成とディレクトリ設計

## 1. 結論
このゲームは、最初は `Webアプリ` として実装するのが最適。

理由:
- 判断中心のゲームであり、ブラウザUIとの相性が良い
- 画面遷移、情報比較、ドラッグ&ドロップが作りやすい
- プレイテスト配布が容易
- 初期MVPはサーバーなしでも成立する

最初の推奨構成は以下。

- フロントエンド: `React + TypeScript + Vite`
- ルーティング: `React Router`
- 状態管理: `Zustand`
- データ検証: `Zod`
- スタイリング: `CSS Modules + CSS Variables`
- テスト: `Vitest + React Testing Library`
- E2E: `Playwright`
- 保存: `localStorage` から開始、必要なら `IndexedDB` に拡張

## 2. なぜこの構成か

### 2-1. `Vite`
- 初期構築が速い
- 静的WebアプリのMVPに十分
- SSR前提ではないので Next.js より軽い

### 2-2. `React`
- 画面単位の状態変化が多い
- パネル、カード、右レール、HUD の再利用がしやすい
- ドラッグ&ドロップUIとの相性が良い

### 2-3. `TypeScript`
- 案件、交渉、イベント、稟議など構造体が多い
- データ不整合が起きやすいゲームなので型の恩恵が大きい

### 2-4. `Zustand`
- ゲーム状態が 1 つの大きな state tree になる
- Redux Toolkit より軽く、MVPでの実装速度が高い
- ただし reducer 的な純関数設計は維持する

### 2-5. `Zod`
- JSON マスタデータの読み込み時に壊れたデータを検知できる
- 将来コンテンツ量が増えた時も安全

### 2-6. `CSS Modules + CSS Variables`
- このゲームは汎用業務UIではなく、独自のゲーム画面らしさが必要
- Tailwind でもできるが、今回のような情報密度の高いレイアウトでは責務分離しやすい
- テーマカラー、パネル、HUD の表現を設計しやすい

## 3. 実装原則

### 3-1. UIとゲームロジックを分ける
一番重要な原則はこれ。

- React コンポーネントは「表示と入力」だけ担当
- 案件成立判定、交渉結果、稟議判定、イベント処理は `game/engine` に置く
- `UIから直接数式を持たない`

これを守ると:
- バランス調整がしやすい
- テストしやすい
- 将来モバイル対応や演出変更をしてもロジックが崩れにくい

### 3-2. データを3層に分ける

#### Master Data
- 地域
- 産業
- 案件テンプレート
- パートナー
- イベントテンプレート

#### Runtime State
- プレイヤー資源
- 断片情報インスタンス
- 案件リード
- 案件
- 交渉状態
- 稟議状態
- 年度進行

#### Derived View
- 案件成立スコア
- 稟議通過見込み
- 交渉受諾率
- ポートフォリオ集中度
- シナジー一覧

### 3-3. 「Phase駆動」で進める
このゲームはフリーフォーム操作より、ターンの中で明確な段階を進める方が分かりやすい。

推奨フェーズ:
- `market_update`
- `intelligence`
- `lead_discovery`
- `deal_structuring`
- `negotiation`
- `approval`
- `operation`
- `risk_response`
- `year_end`

## 4. 推奨アーキテクチャ

### 4-1. 層の分け方

```text
UI Layer
  ↓
Screen / Feature Layer
  ↓
Game Store Layer
  ↓
Game Engine Layer
  ↓
Master Data / Persistence
```

### 4-2. 各層の責務

#### UI Layer
- ボタン
- カード
- パネル
- テーブル
- メーター
- モーダル

#### Screen / Feature Layer
- 画面単位の配置
- ユーザー操作の組み立て
- store からデータを取って表示

#### Game Store Layer
- 現在の `GameState`
- 画面からの action を受け取る
- engine を呼ぶ
- セーブする

#### Game Engine Layer
- 純粋関数
- フェーズ進行
- 案件成立判定
- 交渉判定
- 稟議判定
- イベント適用

#### Master Data / Persistence
- JSON の読み込み
- Zod で検証
- localStorage / IndexedDB 保存

## 5. 画面構成とルーティング方針

### 5-1. MVPのルート案

```text
/                      トップ
/new-game              新規開始
/play/map              ワールドマップ
/play/intelligence     情報収集
/play/inbox            案件インボックス
/play/deal/:dealId     案件組成
/play/negotiation/:id  交渉
/play/approval/:id     稟議
/play/portfolio        ポートフォリオ
/play/risk/:incidentId リスク対応
/play/year-end         決算
```

### 5-2. ルートを分ける理由
- ブラウザバックで前画面に戻しやすい
- プレイテスト時に特定画面を直接確認しやすい
- URL で画面状態を説明しやすい

### 5-3. ただし状態の真実はURLではなく store
- URL は画面位置だけ持つ
- 案件データや交渉状態は store の `GameState` を参照

## 6. ディレクトリ設計

初期MVPでは、`画面` `機能` `ゲームロジック` `マスタデータ` を分けるのが最も扱いやすい。

```text
project-root/
  public/
  src/
    app/
      App.tsx
      main.tsx
      router.tsx
      providers.tsx
      layout/
        AppShell.tsx
        GlobalHud.tsx
        ContextRail.tsx
    screens/
      TopPage/
        TopPage.tsx
      WorldMapPage/
        WorldMapPage.tsx
      IntelligencePage/
        IntelligencePage.tsx
      DealInboxPage/
        DealInboxPage.tsx
      DealCanvasPage/
        DealCanvasPage.tsx
      NegotiationPage/
        NegotiationPage.tsx
      ApprovalPage/
        ApprovalPage.tsx
      PortfolioPage/
        PortfolioPage.tsx
      RiskAlertPage/
        RiskAlertPage.tsx
      YearEndPage/
        YearEndPage.tsx
    features/
      world-map/
        components/
        hooks/
        selectors.ts
      intelligence/
        components/
        actions.ts
        selectors.ts
      inbox/
        components/
        actions.ts
        selectors.ts
      deal-canvas/
        components/
        actions.ts
        selectors.ts
      negotiation/
        components/
        actions.ts
        selectors.ts
      approval/
        components/
        actions.ts
        selectors.ts
      portfolio/
        components/
        selectors.ts
      risk-alert/
        components/
        actions.ts
        selectors.ts
      year-end/
        components/
        selectors.ts
    game/
      engine/
        phases/
          advanceMarketUpdate.ts
          resolveIntelligence.ts
          resolveLeadDiscovery.ts
          resolveDealStructuring.ts
          resolveNegotiation.ts
          resolveApproval.ts
          resolveOperation.ts
          resolveRiskResponse.ts
          resolveYearEnd.ts
        systems/
          dealScoring.ts
          leadGeneration.ts
          negotiationScoring.ts
          approvalScoring.ts
          riskResolution.ts
          synergyResolution.ts
          portfolioValuation.ts
        reducers/
          gameReducer.ts
        state/
          createInitialGameState.ts
          gameStore.ts
          gameActions.ts
        selectors/
          dealSelectors.ts
          playerSelectors.ts
          portfolioSelectors.ts
          riskSelectors.ts
        persistence/
          saveGame.ts
          loadGame.ts
      models/
        types.ts
        ids.ts
        tags.ts
      content/
        loaders.ts
        schemas.ts
    content/
      regions.json
      industries.json
      fragmentTemplates.json
      dealTemplates.json
      partners.json
      eventTemplates.json
      approvalRules.json
      scenario/
        mvp-seed-01.json
    shared/
      ui/
        Button/
        Card/
        MetricChip/
        ProgressBar/
        Modal/
        Tabs/
        Tooltip/
      lib/
        formatters.ts
        numbers.ts
        random.ts
        assertions.ts
      styles/
        tokens.css
        theme.css
        reset.css
      constants/
        routes.ts
        colors.ts
    test/
      fixtures/
      factories/
      helpers/
  package.json
  tsconfig.json
  vite.config.ts
  vitest.config.ts
  playwright.config.ts
```

## 7. フォルダごとの役割

### `src/app`
- React アプリ全体の入口
- provider
- layout
- router

### `src/screens`
- ページ単位の composition
- 各 feature を並べる場所
- 画面固有のレイアウトのみ持つ

### `src/features`
- 画面内のまとまった機能単位
- UIコンポーネントと、その画面に必要な action / selector を置く

### `src/game`
- ゲームの心臓部
- ここは React 非依存にする
- 将来 CLI テストやシミュレーションにも流用可能

### `src/content`
- 手で編集するコンテンツ
- ゲームバランス調整対象

### `src/shared`
- 再利用UI
- 汎用ユーティリティ
- 共通スタイル

## 8. まず作るべき主要ファイル

### 最優先
- `src/game/models/types.ts`
- `src/game/state/createInitialGameState.ts`
- `src/game/state/gameStore.ts`
- `src/game/engine/systems/leadGeneration.ts`
- `src/game/engine/systems/dealScoring.ts`
- `src/game/engine/systems/negotiationScoring.ts`
- `src/game/engine/systems/approvalScoring.ts`
- `src/content/dealTemplates.json`
- `src/content/fragmentTemplates.json`
- `src/content/partners.json`

### その次
- `src/app/router.tsx`
- `src/app/layout/AppShell.tsx`
- `src/screens/WorldMapPage/WorldMapPage.tsx`
- `src/screens/DealCanvasPage/DealCanvasPage.tsx`
- `src/screens/NegotiationPage/NegotiationPage.tsx`
- `src/screens/ApprovalPage/ApprovalPage.tsx`

## 9. 状態管理の設計

### 9-1. store は1つでよい
初期MVPでは global store を 1つにして問題ない。

理由:
- ターン制ゲームで、状態が強く相互依存する
- 案件、交渉、稟議、イベントが同一データを更新する

### 9-2. ただし action は分ける

推奨:
- `gameActions.ts`
- `intelligenceActions.ts`
- `dealActions.ts`
- `negotiationActions.ts`
- `approvalActions.ts`
- `riskActions.ts`

### 9-3. selector を厚くする
UIは store から生の state を大量に読むのではなく、selector 経由で必要な view model を取る。

例:
- `selectWorldMapSummary`
- `selectInboxCandidates`
- `selectDealCanvasView`
- `selectNegotiationView`
- `selectApprovalView`
- `selectPortfolioView`

## 10. コンポーネント設計

### 10-1. 再利用コンポーネント
- `Panel`
- `SectionHeader`
- `MetricCard`
- `RiskBadge`
- `TagChip`
- `PartnerCard`
- `FragmentCard`
- `DecisionBar`
- `PhaseStepper`

### 10-2. ドメインコンポーネント
- `WorldRegionCard`
- `StaffAllocationGrid`
- `LeadCandidateList`
- `DealSlotNode`
- `NegotiationOfferBuilder`
- `ApprovalDepartmentMeter`
- `SynergyGraph`
- `IncidentOptionCard`

### 10-3. コンポーネント分割ルール
- 数式を含むなら `game/engine`
- データ整形だけなら `selectors`
- クリックで action dispatch するだけなら `components`

## 11. データ読み込み設計

### 11-1. 起動時
1. `content/*.json` を読む
2. `Zod` で検証
3. `MasterDataRegistry` を作る
4. `createInitialGameState()` に渡す

### 11-2. セーブ
- MVPでは `localStorage` に `GameState` を保存
- セーブスロットは 3つ程度で十分

### 11-3. 将来拡張
以下が必要になったら `IndexedDB` に移行する。
- セーブ履歴を多く持ちたい
- イベントログが肥大化する
- シナリオデータを分割ロードしたい

## 12. テスト戦略

### 12-1. 単体テスト
対象:
- リード生成
- 案件成立スコア
- 交渉受諾度
- 稟議判定
- シナジー判定

ここは `Vitest` で pure function を叩く。

### 12-2. UIテスト
対象:
- Deal Canvas のスロット入力
- Negotiation の提案操作
- Approval の指摘表示

`React Testing Library` を使う。

### 12-3. E2E
対象:
- 新規ゲーム開始
- 断片情報取得
- 1件案件化
- 交渉
- 稟議
- 年度終了

`Playwright` で1本のゴールデンパスを回す。

## 13. スタイル設計

### 13-1. 見た目の方向性
このゲームは「管理画面」ではなく「国際案件ボード」に見える方が良い。

推奨:
- ベースカラーは `深いネイビー + 青緑 + 鈍い金`
- 背景は単色ベタでなく、微細なグリッドや地図調のレイヤー
- 数値パネルは硬質、ニュースや断片情報カードは少し紙っぽい差分をつける

### 13-2. CSS変数の例

```css
:root {
  --bg-0: #07131d;
  --bg-1: #0d1d2a;
  --panel: #112636;
  --panel-strong: #183247;
  --line: #2e5067;
  --text-0: #e7f1f7;
  --text-1: #a9c0cf;
  --accent-opportunity: #2fb7a8;
  --accent-risk: #e3a64b;
  --accent-danger: #db6b57;
  --accent-hq: #75a7ff;
  --accent-finance: #c9a24f;
}
```

## 14. 初期MVPで入れない方がよいもの
- サーバーAPI
- 認証
- マルチプレイ
- リアルタイム通信
- 複雑なアニメーションフレームワーク
- CMS
- リッチなチャートライブラリ依存

理由:
- まず面白さのボトルネックは UI 演出ではなく、案件組成ロジック
- 将来サーバー化しても、純粋ロジック層が分かれていれば移植しやすい

## 15. 実装の立ち上げ順

1. `Vite + React + TypeScript` の土台を作る
2. `types.ts` と `content schema` を作る
3. `GameState` と `gameStore` を作る
4. `leadGeneration` と `dealScoring` を作る
5. `Deal Canvas` だけ先に画面化する
6. `Negotiation` と `Approval` をつなぐ
7. `World Map` と `Year End` を前後につなぐ
8. `Risk Alert` と `Portfolio` を追加する

## 16. この設計での最初の一歩
もし次に実装へ進むなら、最初に作るべきは以下。

- `package.json`
- `src/game/models/types.ts`
- `src/game/state/createInitialGameState.ts`
- `src/game/state/gameStore.ts`
- `src/content/*.json` の初期 seed
- `src/screens/DealCanvasPage/DealCanvasPage.tsx`

つまり、最初の1本目は `Deal Canvas が動く縦切りWebアプリ` を作るのが正解。

ここが成立すると、このゲームの核である
`断片情報をつないで案件にする快感`
を最速で検証できる。
