import { type PhaseId, type RegionId } from "../../game/models/types";

const phaseLabels: Record<PhaseId, string> = {
  market_update: "情勢変化",
  intelligence: "情報収集",
  lead_discovery: "案件発見",
  deal_structuring: "案件組成",
  negotiation: "交渉",
  approval: "稟議",
  operation: "運営",
  risk_response: "危機対応",
  year_end: "決算"
};

const regionLabels: Record<RegionId, string> = {
  Japan: "日本",
  SEA: "東南アジア",
  MiddleEast: "中東"
};

export const formatMoney = (value: number) =>
  `${value >= 0 ? "+" : "-"}$${Math.abs(Math.round(value))}m`;

export const formatPercent = (value: number) => `${value.toFixed(1)}%`;

export const formatPhase = (phase: PhaseId) => phaseLabels[phase];

export const formatRegion = (region: RegionId) => regionLabels[region];

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
