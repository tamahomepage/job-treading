# 総合商社シミュレーション データモデル定義

## 1. このドキュメントの前提
- 初期プロトタイプは TypeScript 実装を想定
- マスタデータは JSON ファイルからロード
- ランタイム状態は 1つの `GameState` に集約
- 計算で得られる値は保存せず、原則 selector で導出する

## 2. データレイヤー

### 2-1. Master Data
ゲーム開始前に決まっている固定データ。
- 地域
- 産業
- 案件テンプレート
- パートナー
- 断片情報テンプレート
- イベントテンプレート
- 社内部門ルール

### 2-2. Runtime State
プレイ中に変化するデータ。
- プレイヤー状態
- ターン状態
- 断片情報インスタンス
- 案件リード
- 案件
- 交渉セッション
- 稟議ケース
- 発生イベント

### 2-3. Derived View Model
画面表示のために計算される値。
- 案件成立スコア
- 交渉受諾予測
- 稟議通過予測
- ポートフォリオ集中度
- シナジー一覧
- 年度評価

## 3. TypeScript 基本型

```ts
export type RegionId = "Japan" | "SEA" | "MiddleEast";

export type IndustryId = "energy" | "food" | "mobility" | "infrastructure";

export type PhaseId =
  | "market_update"
  | "intelligence"
  | "lead_discovery"
  | "deal_structuring"
  | "negotiation"
  | "approval"
  | "operation"
  | "risk_response"
  | "year_end";

export type DealStage =
  | "lead"
  | "structuring"
  | "approval_pending"
  | "approved"
  | "execution"
  | "operating"
  | "restructuring"
  | "divested"
  | "terminated";

export type DealSlotId =
  | "demand"
  | "technology"
  | "localPartner"
  | "finance"
  | "permit"
  | "logistics"
  | "offtake"
  | "operator";

export type PartnerType =
  | "government"
  | "state_owned"
  | "local_company"
  | "conglomerate"
  | "manufacturer"
  | "bank"
  | "fund"
  | "logistics"
  | "offtaker"
  | "hq_department";

export type EventCategory =
  | "market"
  | "geopolitics"
  | "regulation"
  | "fx"
  | "supply_chain"
  | "accident"
  | "esg"
  | "natural_disaster"
  | "partner_scandal";

export type FragmentTag =
  | "need"
  | "supply"
  | "finance"
  | "access"
  | "partner"
  | "risk"
  | "power"
  | "food_security"
  | "port"
  | "grid"
  | "demand_growth"
  | "subsidy"
  | "logistics_bottleneck"
  | "government_access"
  | "fuel_import"
  | "cold_chain"
  | "distribution";

export type StaffRole =
  | "originator"
  | "bizdev"
  | "finance"
  | "legal"
  | "ops"
  | "gov";

export type ApprovalDepartmentId =
  | "finance"
  | "risk"
  | "legal"
  | "esg"
  | "management"
  | "business_unit";
```

## 4. Master Data 型

### 4-1. RegionDefinition

```ts
export interface RegionDefinition {
  id: RegionId;
  name: string;
  demandGrowthBase: Partial<Record<IndustryId, number>>;
  politicalRiskBase: number;
  fxVolatilityBase: number;
  permitDifficultyBase: number;
  disasterRiskBase: number;
  baseTrust: number;
  preferredPartnerTypes: PartnerType[];
  specialTags: string[];
}
```

### 4-2. IndustryDefinition

```ts
export interface IndustryDefinition {
  id: IndustryId;
  name: string;
  capitalIntensity: number;
  baseReturnMin: number;
  baseReturnMax: number;
  esgSensitivity: number;
  templateIds: string[];
  synergyFamilies: string[];
}
```

### 4-3. FragmentTemplate

```ts
export interface FragmentTemplate {
  id: string;
  title: string;
  regionPool: RegionId[];
  industryPool: IndustryId[];
  sourceType: string;
  tags: FragmentTag[];
  certaintyRange: [number, number];
  expiryRange: [number, number];
  weightRules: Array<{
    when: string;
    bonus: number;
  }>;
  leadValue: number;
  textParams?: string[];
}
```

### 4-4. DealTemplate

```ts
export interface DealTemplate {
  id: string;
  name: string;
  industry: IndustryId;
  requiredSlots: DealSlotId[];
  mandatoryTags: string[];
  optionalTags: string[];
  baseCapex: number;
  baseEquityRatio: number;
  baseIrr: number;
  timeToOperate: number;
  riskWeights: Partial<Record<EventCategory, number>>;
  synergyTags: string[];
  unlockRules: Array<{
    anyOfTags?: string[];
    allOfTags?: string[];
    regionIds?: RegionId[];
  }>;
}
```

### 4-5. PartnerDefinition

```ts
export interface PartnerDefinition {
  id: string;
  name: string;
  type: PartnerType;
  regions: RegionId[];
  industries: IndustryId[];
  capabilityTags: string[];
  offerableSlots: DealSlotId[];
  preferenceWeights: Record<string, number>;
  relationshipBase: number;
  redLines: string[];
  hiddenTraits: string[];
  negotiationTopics: string[];
}
```

### 4-6. EventTemplate

```ts
export interface EventTemplate {
  id: string;
  name: string;
  category: EventCategory;
  triggerRules: {
    minTurn?: number;
    regionIds?: RegionId[];
    industries?: IndustryId[];
    requiredExposureTags?: string[];
    macroFlags?: string[];
  };
  severityBase: number;
  targetRules: {
    regionIds?: RegionId[];
    industries?: IndustryId[];
    dealTags?: string[];
  };
  immediateEffects: Array<{
    key: string;
    value: number;
  }>;
  responseOptions: string[];
  upsideUnlocks?: string[];
}
```

### 4-7. ApprovalDepartmentRule

```ts
export interface ApprovalDepartmentRule {
  id: ApprovalDepartmentId;
  displayName: string;
  weights: Record<string, number>;
  vetoRules: Array<{
    key: string;
    op: "gt" | "gte" | "lt" | "lte" | "eq";
    value: number;
    message: string;
  }>;
}
```

## 5. Runtime State 型

### 5-1. GameState

```ts
export interface GameState {
  seed: string;
  turn: number;
  maxTurns: number;
  currentPhase: PhaseId;
  marketState: MarketState;
  player: PlayerState;
  fragments: FragmentInstance[];
  leads: LeadState[];
  deals: DealState[];
  negotiations: NegotiationSession[];
  approvals: ApprovalCase[];
  incidents: IncidentState[];
  messageLog: GameMessage[];
  flags: Record<string, boolean | number | string>;
}
```

### 5-2. MarketState

```ts
export interface MarketState {
  year: number;
  regionMetrics: Record<RegionId, RegionMetricState>;
  commodityPrices: Record<string, number>;
  fxRates: Record<string, number>;
  policySignals: string[];
  macroFlags: string[];
}

export interface RegionMetricState {
  opportunityScore: number;
  riskScore: number;
  demandGrowth: Partial<Record<IndustryId, number>>;
  permitTightness: number;
  publicSentiment: number;
}
```

### 5-3. PlayerState

```ts
export interface PlayerState {
  cash: number;
  investmentCapacity: number;
  creditStrength: number;
  hqReputation: number;
  esgScore: number;
  riskCapacity: number;
  yearlyActionBudget: number;
  actionsRemaining: number;
  yearlyApprovalSlots: number;
  approvalsRemaining: number;
  emergencyActionsRemaining: number;
  staff: Record<StaffRole, StaffPool>;
  regionalTrust: Record<RegionId, number>;
  partnerRelations: Record<string, number>;
  infoNetwork: Record<RegionId, Partial<Record<IndustryId, number>>>;
  ownedAssets: string[];
  yearlyFocus?: "network" | "capital_efficiency" | "esg_recovery";
}

export interface StaffPool {
  total: number;
  assigned: number;
  fatigue: number;
}
```

### 5-4. FragmentInstance

```ts
export interface FragmentInstance {
  id: string;
  templateId: string;
  title: string;
  region: RegionId;
  industry: IndustryId;
  sourceType: string;
  tags: FragmentTag[];
  certainty: number;
  expiresIn: number;
  leadValue: number;
  pinned: boolean;
  discoveredTurn: number;
}
```

### 5-5. LeadState

```ts
export interface LeadState {
  id: string;
  name: string;
  region: RegionId;
  industry: IndustryId;
  fragmentIds: string[];
  candidateTemplateIds: string[];
  selectedTemplateId?: string;
  score: number;
  missingNeeds: string[];
  status: "open" | "promoted" | "discarded";
}
```

### 5-6. DealState

```ts
export interface DealState {
  id: string;
  name: string;
  templateId: string;
  region: RegionId;
  industry: IndustryId;
  stage: DealStage;
  sourceLeadId?: string;
  slotAssignments: Partial<Record<DealSlotId, DealSlotAssignment>>;
  contractTerms: ContractTerms;
  capex: number;
  equityRequired: number;
  debtRatio: number;
  expectedIrr: number;
  approvalDifficulty: number;
  structureScore: number;
  riskExposure: Partial<Record<EventCategory, number>>;
  synergyTags: string[];
  timeline: DealTimeline;
  operatingMetrics?: OperatingMetrics;
  history: DealHistoryEntry[];
}

export interface DealSlotAssignment {
  kind: "fragment" | "partner" | "derived";
  refId: string;
  quality: number;
}

export interface ContractTerms {
  equitySharePlayer: number;
  controlLevel: number;
  localContentRatio: number;
  offtakeYears: number;
  priceAdjustmentClause: boolean;
  esgMitigationBudget: number;
  exitOption: boolean;
  guarantees: string[];
}

export interface DealTimeline {
  createdTurn: number;
  approvedTurn?: number;
  operatingTurn?: number;
  targetOperateIn: number;
}

export interface OperatingMetrics {
  utilizationRate: number;
  revenue: number;
  ebitda: number;
  maintenanceRisk: number;
  localReputation: number;
  incidentRisk: number;
}

export interface DealHistoryEntry {
  turn: number;
  type: string;
  message: string;
}
```

### 5-7. NegotiationSession

```ts
export interface NegotiationSession {
  id: string;
  dealId: string;
  partnerId: string;
  round: number;
  maxRounds: number;
  topic: string;
  proposedTerms: string[];
  concessions: string[];
  acceptancePreview: number;
  status: "open" | "agreed" | "stalled" | "walked";
  revealedPreferences: string[];
  log: NegotiationLogEntry[];
}

export interface NegotiationLogEntry {
  round: number;
  speaker: "player" | "partner";
  text: string;
  deltaRelationship?: number;
}
```

### 5-8. ApprovalCase

```ts
export interface ApprovalCase {
  id: string;
  dealId: string;
  submittedTurn: number;
  departmentScores: Record<ApprovalDepartmentId, number>;
  vetoMessages: string[];
  recommendedActions: string[];
  status: "draft" | "submitted" | "conditional" | "approved" | "rejected";
}
```

### 5-9. IncidentState

```ts
export interface IncidentState {
  id: string;
  templateId: string;
  turn: number;
  category: EventCategory;
  severity: number;
  targetDealIds: string[];
  targetRegionIds: RegionId[];
  responseOptions: IncidentResponseOption[];
  resolved: boolean;
}

export interface IncidentResponseOption {
  id: string;
  label: string;
  cashImpact: number;
  delayImpact: number;
  trustImpact: number;
  esgImpact: number;
  unlocks?: string[];
}
```

### 5-10. GameMessage

```ts
export interface GameMessage {
  id: string;
  turn: number;
  phase: PhaseId;
  level: "info" | "warning" | "critical";
  title: string;
  body: string;
  relatedIds?: string[];
}
```

## 6. 主要 selector / derived model

```ts
export interface DealComputedView {
  dealId: string;
  structureScore: number;
  slotCompletionRate: number;
  fundingViabilityScore: number;
  unresolvedRisks: string[];
  synergyPreview: string[];
  approvalPreview: number;
}

export interface PortfolioComputedView {
  corporateValueScore: number;
  cashFlowProjection: number;
  concentrationRiskScore: number;
  synergyEdges: Array<{
    fromDealId: string;
    toDealId: string;
    type: "vertical" | "regional" | "functional" | "resilience";
    value: number;
  }>;
}
```

## 7. 保存形式の推奨

### 7-1. マスタデータ

```text
data/
  regions.json
  industries.json
  fragmentTemplates.json
  dealTemplates.json
  partners.json
  eventTemplates.json
  approvalRules.json
```

### 7-2. セーブデータ

```text
saves/
  slot-1.json
  slot-2.json
```

## 8. JSON サンプル

### 8-1. regions.json

```json
[
  {
    "id": "SEA",
    "name": "Southeast Asia",
    "demandGrowthBase": {
      "energy": 4,
      "food": 3,
      "mobility": 4,
      "infrastructure": 5
    },
    "politicalRiskBase": 2,
    "fxVolatilityBase": 3,
    "permitDifficultyBase": 3,
    "disasterRiskBase": 4,
    "baseTrust": 1,
    "preferredPartnerTypes": ["government", "conglomerate", "bank"],
    "specialTags": ["monsoon", "growth_market", "import_dependency"]
  }
]
```

### 8-2. fragmentTemplates.json

```json
[
  {
    "id": "frag_vn_power_demand",
    "title": "Power demand surges in southern Vietnam",
    "regionPool": ["SEA"],
    "industryPool": ["energy"],
    "sourceType": "government",
    "tags": ["need", "power", "demand_growth"],
    "certaintyRange": [2, 4],
    "expiryRange": [2, 3],
    "weightRules": [
      {
        "when": "market.region.SEA.opportunityScore >= 70",
        "bonus": 2
      }
    ],
    "leadValue": 2
  },
  {
    "id": "frag_sea_port_bottleneck",
    "title": "Port congestion worsens across coastal routes",
    "regionPool": ["SEA"],
    "industryPool": ["energy", "food", "infrastructure"],
    "sourceType": "trade_media",
    "tags": ["risk", "port", "logistics_bottleneck"],
    "certaintyRange": [1, 3],
    "expiryRange": [2, 4],
    "weightRules": [],
    "leadValue": 1
  }
]
```

### 8-3. dealTemplates.json

```json
[
  {
    "id": "gas_to_power",
    "name": "LNG to Power",
    "industry": "energy",
    "requiredSlots": [
      "demand",
      "technology",
      "localPartner",
      "finance",
      "permit",
      "logistics",
      "offtake",
      "operator"
    ],
    "mandatoryTags": ["power", "government_access"],
    "optionalTags": ["fuel_import", "port", "subsidy"],
    "baseCapex": 180,
    "baseEquityRatio": 0.25,
    "baseIrr": 0.11,
    "timeToOperate": 2,
    "riskWeights": {
      "fx": 3,
      "regulation": 3,
      "supply_chain": 4,
      "esg": 3
    },
    "synergyTags": ["lng", "power", "grid", "sea_logistics"],
    "unlockRules": [
      {
        "allOfTags": ["need", "power"],
        "anyOfTags": ["finance", "access"],
        "regionIds": ["SEA", "MiddleEast"]
      }
    ]
  }
]
```

### 8-4. partners.json

```json
[
  {
    "id": "partner_sg_project_bank",
    "name": "Singapore Project Bank",
    "type": "bank",
    "regions": ["SEA", "MiddleEast"],
    "industries": ["energy", "infrastructure"],
    "capabilityTags": ["finance", "infra_debt"],
    "offerableSlots": ["finance"],
    "preferenceWeights": {
      "safety": 5,
      "yield": 2,
      "esg": 3,
      "control": 1
    },
    "relationshipBase": 1,
    "redLines": ["unhedged_fx", "weak_offtake"],
    "hiddenTraits": ["likes_export_credit_support"],
    "negotiationTopics": ["pricing", "guarantee", "tenor", "covenant"]
  }
]
```

### 8-5. approvalRules.json

```json
[
  {
    "id": "finance",
    "displayName": "Finance",
    "weights": {
      "expectedIrr": 4,
      "paybackYears": -3,
      "equityRequired": -2,
      "cashBufferAfterInvestment": 3
    },
    "vetoRules": [
      {
        "key": "cashBufferAfterInvestment",
        "op": "lt",
        "value": 15,
        "message": "Post-investment cash buffer is too thin."
      }
    ]
  }
]
```

### 8-6. セーブデータ例

```json
{
  "seed": "demo-sea-001",
  "turn": 3,
  "maxTurns": 6,
  "currentPhase": "deal_structuring",
  "marketState": {
    "year": 2028,
    "regionMetrics": {
      "Japan": {
        "opportunityScore": 44,
        "riskScore": 20,
        "demandGrowth": {
          "energy": 1,
          "food": 1
        },
        "permitTightness": 2,
        "publicSentiment": 0
      },
      "SEA": {
        "opportunityScore": 77,
        "riskScore": 46,
        "demandGrowth": {
          "energy": 4,
          "food": 3,
          "infrastructure": 4
        },
        "permitTightness": 3,
        "publicSentiment": 1
      },
      "MiddleEast": {
        "opportunityScore": 61,
        "riskScore": 53,
        "demandGrowth": {
          "energy": 3,
          "infrastructure": 2
        },
        "permitTightness": 2,
        "publicSentiment": 0
      }
    },
    "commodityPrices": {
      "lng": 128,
      "wheat": 96
    },
    "fxRates": {
      "USDJPY": 149.2
    },
    "policySignals": ["sea_green_subsidy_up"],
    "macroFlags": ["growth_rebound"]
  },
  "player": {
    "cash": 112,
    "investmentCapacity": 60,
    "creditStrength": 3,
    "hqReputation": 6,
    "esgScore": 52,
    "riskCapacity": 10,
    "yearlyActionBudget": 6,
    "actionsRemaining": 3,
    "yearlyApprovalSlots": 2,
    "approvalsRemaining": 1,
    "emergencyActionsRemaining": 1,
    "staff": {
      "originator": { "total": 2, "assigned": 2, "fatigue": 1 },
      "bizdev": { "total": 2, "assigned": 1, "fatigue": 0 },
      "finance": { "total": 1, "assigned": 1, "fatigue": 0 },
      "legal": { "total": 1, "assigned": 0, "fatigue": 0 },
      "ops": { "total": 1, "assigned": 0, "fatigue": 0 },
      "gov": { "total": 1, "assigned": 1, "fatigue": 0 }
    },
    "regionalTrust": {
      "Japan": 1,
      "SEA": 3,
      "MiddleEast": 0
    },
    "partnerRelations": {
      "partner_sg_project_bank": 2,
      "partner_vn_utility": 1
    },
    "infoNetwork": {
      "Japan": { "energy": 1, "food": 1 },
      "SEA": { "energy": 2, "food": 1, "infrastructure": 1 },
      "MiddleEast": { "energy": 0 }
    },
    "ownedAssets": ["asset_sea_port_terminal"],
    "yearlyFocus": "network"
  },
  "fragments": [
    {
      "id": "frag_inst_001",
      "templateId": "frag_vn_power_demand",
      "title": "Power demand surges in southern Vietnam",
      "region": "SEA",
      "industry": "energy",
      "sourceType": "government",
      "tags": ["need", "power", "demand_growth"],
      "certainty": 3,
      "expiresIn": 2,
      "leadValue": 2,
      "pinned": true,
      "discoveredTurn": 3
    }
  ],
  "leads": [
    {
      "id": "lead_001",
      "name": "South Coast LNG Power Platform",
      "region": "SEA",
      "industry": "energy",
      "fragmentIds": ["frag_inst_001"],
      "candidateTemplateIds": ["gas_to_power", "t_and_d_upgrade"],
      "selectedTemplateId": "gas_to_power",
      "score": 61,
      "missingNeeds": ["localPartner", "logistics", "operator"],
      "status": "open"
    }
  ],
  "deals": [],
  "negotiations": [],
  "approvals": [],
  "incidents": [],
  "messageLog": [],
  "flags": {}
}
```

## 9. 計算ロジックで使う入力値

### 9-1. リード生成
- `FragmentInstance.tags`
- `FragmentInstance.certainty`
- `MarketState.regionMetrics`
- `PlayerState.infoNetwork`

### 9-2. 案件成立スコア
- `DealState.slotAssignments`
- `DealTemplate.requiredSlots`
- `ContractTerms`
- `PlayerState.partnerRelations`
- `PlayerState.ownedAssets`
- `DealState.riskExposure`

### 9-3. 交渉受諾度
- `PartnerDefinition.preferenceWeights`
- `PartnerDefinition.redLines`
- `NegotiationSession.proposedTerms`
- `PlayerState.partnerRelations[partnerId]`

### 9-4. 稟議評価
- `ApprovalDepartmentRule.weights`
- `DealState.expectedIrr`
- `DealState.equityRequired`
- `DealState.riskExposure`
- `PlayerState.cash`
- `PlayerState.esgScore`

## 10. 実装時の注意
- 断片情報テンプレートとインスタンスを分ける
- ランタイム状態には UI 専用フラグを入れすぎない
- スコアの内訳は debug 用に返せるようにする
- Deal、Negotiation、Approval が別々の条件を持たず、最終的に同じ `ContractTerms` を更新する構造にする
- シナジーは保存値でなく、保有アセットのタグ接続から毎回導出する

## 11. 最初の簡易版で削ってよいもの
- `MiddleEast` と `Japan` の実装
- `mobility` と `infrastructure` の本格対応
- `fund` や `hq_department` の細かい種類分け
- `Derived View Model` の高度な履歴比較
- `IncidentState` の複数同時発生

この簡易版で残すべき最低限:
- `SEA`
- `energy`
- `food`
- `FragmentInstance`
- `LeadState`
- `DealState`
- `NegotiationSession`
- `ApprovalCase`
- `PlayerState`
