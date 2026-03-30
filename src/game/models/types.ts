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
  | "distribution"
  | "manufacturer_capacity"
  | "permit";

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
}

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

export interface MasterData {
  regions: RegionDefinition[];
  industries: IndustryDefinition[];
  fragmentTemplates: FragmentTemplate[];
  dealTemplates: DealTemplate[];
  partners: PartnerDefinition[];
  eventTemplates: EventTemplate[];
  approvalRules: ApprovalDepartmentRule[];
}

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

export interface StaffPool {
  total: number;
  assigned: number;
  fatigue: number;
}

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

export interface LeadCandidateView {
  id: string;
  name: string;
  region: RegionId;
  industry: IndustryId;
  fragmentIds: string[];
  candidateTemplateIds: string[];
  score: number;
  missingNeeds: string[];
  rationale: string[];
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

export interface NegotiationLogEntry {
  round: number;
  speaker: "player" | "partner";
  text: string;
  deltaRelationship?: number;
}

export interface NegotiationSession {
  id: string;
  dealId: string;
  partnerId: string;
  requestedSlot: DealSlotId;
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

export interface ApprovalCase {
  id: string;
  dealId: string;
  submittedTurn: number;
  departmentScores: Record<ApprovalDepartmentId, number>;
  vetoMessages: string[];
  recommendedActions: string[];
  status: "draft" | "submitted" | "conditional" | "approved" | "rejected";
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

export interface GameMessage {
  id: string;
  turn: number;
  phase: PhaseId;
  level: "info" | "warning" | "critical";
  title: string;
  body: string;
  relatedIds?: string[];
}

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

export const phaseOrder: PhaseId[] = [
  "market_update",
  "intelligence",
  "lead_discovery",
  "deal_structuring",
  "negotiation",
  "approval",
  "operation",
  "risk_response",
  "year_end"
];
