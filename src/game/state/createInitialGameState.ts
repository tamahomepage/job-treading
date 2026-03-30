import { masterData } from "../content/loaders";
import type {
  FragmentInstance,
  FragmentTemplate,
  GameState,
  MasterData,
  RegionId,
  StaffRole
} from "../models/types";

const createFragmentInstance = (
  template: FragmentTemplate,
  index: number,
  turn: number
): FragmentInstance => {
  const certaintySpan =
    template.certaintyRange[1] - template.certaintyRange[0] + 1;
  const expirySpan = template.expiryRange[1] - template.expiryRange[0] + 1;

  return {
    id: `frag_inst_${turn}_${index}`,
    templateId: template.id,
    title: template.title,
    region: template.regionPool[index % template.regionPool.length],
    industry: template.industryPool[index % template.industryPool.length],
    sourceType: template.sourceType,
    tags: template.tags,
    certainty: template.certaintyRange[0] + (index % certaintySpan),
    expiresIn: template.expiryRange[0] + (index % expirySpan),
    leadValue: template.leadValue,
    pinned: false,
    discoveredTurn: turn
  };
};

const createMarketMetrics = (regionId: RegionId, data: MasterData) => {
  const region = data.regions.find((entry) => entry.id === regionId);

  if (!region) {
    throw new Error(`Unknown region: ${regionId}`);
  }

  return {
    opportunityScore: 40 + region.baseTrust * 8 + region.permitDifficultyBase * 4,
    riskScore:
      region.politicalRiskBase * 12 +
      region.fxVolatilityBase * 8 +
      region.disasterRiskBase * 6,
    demandGrowth: region.demandGrowthBase,
    permitTightness: region.permitDifficultyBase,
    publicSentiment: region.baseTrust
  };
};

const createStaffState = (): Record<StaffRole, { total: number; assigned: number; fatigue: number }> => ({
  originator: { total: 2, assigned: 0, fatigue: 0 },
  bizdev: { total: 2, assigned: 0, fatigue: 0 },
  finance: { total: 1, assigned: 0, fatigue: 0 },
  legal: { total: 1, assigned: 0, fatigue: 0 },
  ops: { total: 1, assigned: 0, fatigue: 0 },
  gov: { total: 1, assigned: 0, fatigue: 0 }
});

export function createInitialGameState(data: MasterData = masterData): GameState {
  const initialTemplates = data.fragmentTemplates.slice(0, 5);
  const initialFragments = initialTemplates.map((template, index) =>
    createFragmentInstance(template, index, 1)
  );

  return {
    seed: "mvp-sea-001",
    turn: 1,
    maxTurns: 8,
    currentPhase: "market_update",
    marketState: {
      year: 2026,
      regionMetrics: {
        Japan: createMarketMetrics("Japan", data),
        SEA: {
          ...createMarketMetrics("SEA", data),
          opportunityScore: 78
        },
        MiddleEast: createMarketMetrics("MiddleEast", data)
      },
      commodityPrices: {
        lng: 126,
        wheat: 97,
        copper: 104
      },
      fxRates: {
        USDJPY: 148.2
      },
      policySignals: ["sea_transition_power_subsidy"],
      macroFlags: ["growth_rebound"]
    },
    player: {
      cash: 120,
      investmentCapacity: 80,
      creditStrength: 3,
      hqReputation: 4,
      esgScore: 52,
      riskCapacity: 10,
      yearlyActionBudget: 6,
      actionsRemaining: 6,
      yearlyApprovalSlots: 2,
      approvalsRemaining: 2,
      emergencyActionsRemaining: 1,
      staff: createStaffState(),
      regionalTrust: {
        Japan: 1,
        SEA: 2,
        MiddleEast: 0
      },
      partnerRelations: Object.fromEntries(
        data.partners.map((partner) => [partner.id, partner.relationshipBase])
      ),
      infoNetwork: {
        Japan: { energy: 1, food: 1 },
        SEA: { energy: 2, food: 1, infrastructure: 1 },
        MiddleEast: { energy: 1 }
      },
      ownedAssets: ["asset_sea_port_terminal"],
      yearlyFocus: "network"
    },
    fragments: initialFragments,
    leads: [],
    deals: [],
    negotiations: [],
    approvals: [],
    incidents: [],
    messageLog: [
      {
        id: "msg_init_01",
        turn: 1,
        phase: "market_update",
        level: "info",
        title: "東南アジアで案件機会が拡大",
        body: "電力需要と港湾ボトルネックの両方が顕在化しています。情報収集から案件化につなげてください。"
      }
    ],
    flags: {}
  };
}
