# Global Value Architect

総合商社の仕事の面白さを体験できるシミュレーションゲームのプロトタイプです。

プレイヤーは、世界中の断片情報を集めて案件機会を見つけ、パートナー、資金、物流、販売先、社内稟議を組み合わせながら、単発案件ではなくポートフォリオ全体の価値を高めていきます。

## 今あるもの

- 依存なしで動かせる静的Webアプリ本体
  - [index.html](/Users/ootamatadashi/Desktop/就活ナビ業界別体験ゲーム/index.html)
  - [webapp/main.js](/Users/ootamatadashi/Desktop/就活ナビ業界別体験ゲーム/webapp/main.js)
  - [webapp/game.js](/Users/ootamatadashi/Desktop/就活ナビ業界別体験ゲーム/webapp/game.js)
  - [webapp/data.js](/Users/ootamatadashi/Desktop/就活ナビ業界別体験ゲーム/webapp/data.js)
  - [webapp/styles.css](/Users/ootamatadashi/Desktop/就活ナビ業界別体験ゲーム/webapp/styles.css)
- React/Vite 前提の将来拡張用雛形
  - [package.json](/Users/ootamatadashi/Desktop/就活ナビ業界別体験ゲーム/package.json)
  - [src/](/Users/ootamatadashi/Desktop/就活ナビ業界別体験ゲーム/src)
- 仕様・設計ドキュメント
  - [総合商社シミュレーション_プロトタイプ仕様書.md](/Users/ootamatadashi/Desktop/就活ナビ業界別体験ゲーム/総合商社シミュレーション_プロトタイプ仕様書.md)
  - [implementation_task_breakdown.md](/Users/ootamatadashi/Desktop/就活ナビ業界別体験ゲーム/implementation_task_breakdown.md)
  - [ui_wireframes_and_flow.md](/Users/ootamatadashi/Desktop/就活ナビ業界別体験ゲーム/ui_wireframes_and_flow.md)
  - [data_model_typescript_and_json.md](/Users/ootamatadashi/Desktop/就活ナビ業界別体験ゲーム/data_model_typescript_and_json.md)
  - [web_app_technical_architecture.md](/Users/ootamatadashi/Desktop/就活ナビ業界別体験ゲーム/web_app_technical_architecture.md)

## 現在のプロトタイプでできること

- ワールドマップで地域機会を確認
- 情報収集で断片情報を追加
- Inbox で断片情報をピン留めし、案件候補を作成
- Deal Canvas で案件スロットを埋める
- パートナー交渉を行う
- 稟議判定を行う
- ポートフォリオとシナジーを見る
- リスクイベントを発生させて対応する
- Year End で来期方針を決める

## 起動方法

この環境では Node.js が無くても動くように、静的ファイル版を用意しています。

### もっとも簡単な方法

Python の簡易サーバーを使います。

```bash
python3 -m http.server 8000
```

その後、ブラウザで以下を開きます。

```text
http://127.0.0.1:8000/
```

## ディレクトリの見方

### 実際に動く本体

- `index.html`
- `webapp/`

### 将来 React/Vite 化するための土台

- `package.json`
- `src/`
- `vite.config.ts`
- `tsconfig*.json`

### 企画・設計資料

- ルートの `*.md`

## 注意

- いま一番完成しているのは `webapp/` の静的版です
- `src/` 以下の React/Vite 版は、将来の本実装に向けた雛形です
- ライセンスはまだ未設定です
- GitHub に上げる前に、必要ならリポジトリ名や説明文を README 冒頭で調整してください

## 次にやると良いこと

1. GitHub に push
2. 静的版を触ってコア体験を検証
3. フィードバックをもとに `webapp/` を改修するか、`src/` の React 版へ本移行するか決める
