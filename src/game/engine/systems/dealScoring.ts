import { clamp } from "../../../shared/lib/formatters";
import type {
  DealComputedView,
  DealSlotId,
  DealState,
  DealTemplate,
  FragmentInstance,
  GameState,
  MasterData,
  PartnerDefinition
} from "../../models/types";

const slotTagHints: Record<DealSlotId, string[]> = {
  demand: ["need", "power", "food_security", "demand_growth"],
  technology: ["supply", "grid", "manufacturer_capacity"],
  localPartner: ["partner"],
  finance: ["finance"],
  permit: ["access", "government_access", "subsidy", "permit"],
  logistics: ["port", "distribution", "logistics_bottleneck"],
  offtake: ["partner", "distribution", "power", "food_security"],
  operator: ["distribution", "grid", "power"]
};

export interface SlotSuggestion {
  fragments: FragmentInstance[];
  partners: PartnerDefinition[];
}

export const getTemplateById = (data: MasterData, templateId: string) => {
  const template = data.dealTemplates.find((entry) => entry.id === templateId);

  if (!template) {
    throw new Error(`Unknown deal template: ${templateId}`);
  }

  return template;
};

export const getLeadFragments = (game: GameState, deal: DealState) => {
  const lead = game.leads.find((entry) => entry.id === deal.sourceLeadId);

  return lead
    ? game.fragments.filter((fragment) => lead.fragmentIds.includes(fragment.id))
    : [];
};

export const getSlotSuggestions = (
  game: GameState,
  deal: DealState,
  data: MasterData,
  slotId: DealSlotId
): SlotSuggestion => {
  const leadFragments = getLeadFragments(game, deal);
  const fragmentHints = slotTagHints[slotId];

  return {
    fragments: leadFragments.filter((fragment) =>
      fragment.tags.some((tag) => fragmentHints.includes(tag))
    ),
    partners: data.partners.filter(
      (partner) =>
        partner.offerableSlots.includes(slotId) &&
        partner.regions.includes(deal.region) &&
        partner.industries.includes(deal.industry)
    )
  };
};

const getFundingViabilityScore = (deal: DealState, game: GameState) => {
  const financeSlot = deal.slotAssignments.finance;
  const financeRelation = financeSlot
    ? game.player.partnerRelations[financeSlot.refId] ?? 0
    : 0;

  return clamp(
    28 +
      financeRelation * 8 +
      (game.player.creditStrength + game.player.hqReputation) * 6 -
      deal.equityRequired * 0.12,
    0,
    100
  );
};

const getSynergyPreview = (deal: DealState, game: GameState) => {
  const previews: string[] = [];

  if (deal.synergyTags.includes("sea_logistics") && game.player.ownedAssets.includes("asset_sea_port_terminal")) {
    previews.push("港湾アセットと接続して物流救済ルートが開く");
  }

  if (deal.synergyTags.includes("power")) {
    previews.push("電力案件の実績が次の送配電案件の稟議を軽くする");
  }

  return previews;
};

export function computeDealView(
  deal: DealState,
  game: GameState,
  data: MasterData
): DealComputedView {
  const template: DealTemplate = getTemplateById(data, deal.templateId);
  const filledSlots = template.requiredSlots.filter(
    (slot) => deal.slotAssignments[slot]
  );
  const unresolvedRisks: string[] = [];

  if (!deal.slotAssignments.finance) {
    unresolvedRisks.push("資金調達の裏付けが弱い");
  }
  if (!deal.slotAssignments.localPartner) {
    unresolvedRisks.push("現地パートナー不在");
  }
  if (!deal.slotAssignments.logistics) {
    unresolvedRisks.push("物流ボトルネックが未解決");
  }
  if (deal.contractTerms.esgMitigationBudget < 8) {
    unresolvedRisks.push("ESG対策が薄い");
  }

  const fundingViabilityScore = getFundingViabilityScore(deal, game);
  const synergyPreview = getSynergyPreview(deal, game);

  const structureScore = clamp(
    18 +
      (filledSlots.length / template.requiredSlots.length) * 56 +
      fundingViabilityScore * 0.14 +
      synergyPreview.length * 6 -
      unresolvedRisks.length * 5,
    0,
    100
  );

  const approvalPreview = clamp(
    structureScore +
      game.player.hqReputation * 2 +
      game.player.esgScore * 0.18 -
      deal.approvalDifficulty * 0.5,
    0,
    100
  );

  return {
    dealId: deal.id,
    structureScore,
    slotCompletionRate: filledSlots.length / template.requiredSlots.length,
    fundingViabilityScore,
    unresolvedRisks,
    synergyPreview,
    approvalPreview
  };
}

export function recomputeDealState(
  deal: DealState,
  game: GameState,
  data: MasterData
): DealState {
  const view = computeDealView(deal, game, data);

  return {
    ...deal,
    structureScore: view.structureScore,
    expectedIrr: clamp(
      8 +
        view.slotCompletionRate * 7 +
        deal.contractTerms.controlLevel * 1.5 +
        view.synergyPreview.length * 1.2,
      6,
      22
    ),
    approvalDifficulty: clamp(
      88 -
        view.slotCompletionRate * 32 -
        game.player.hqReputation * 2 +
        view.unresolvedRisks.length * 4,
      20,
      95
    )
  };
}
