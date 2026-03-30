import {
  approvalRules,
  dealTemplates,
  fragmentTemplates,
  partners,
  phaseOrder,
  regions,
  riskTemplates,
  slotHints
} from "./data.js";

const storageKey = "gva-static-prototype";

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function pickDeterministic(range, seed) {
  const [min, max] = range;
  return min + (seed % (max - min + 1));
}

export function regionName(regionId) {
  return regions.find((region) => region.id === regionId)?.name ?? regionId;
}

function createMarketMetrics(region) {
  return {
    opportunityScore: 40 + region.baseTrust * 8 + region.permitDifficulty * 4,
    riskScore:
      region.politicalRisk * 12 +
      region.fxVolatility * 8 +
      region.disasterRisk * 6,
    demandGrowth: region.demandGrowth,
    permitTightness: region.permitDifficulty,
    publicSentiment: region.baseTrust
  };
}

function createInitialFragments() {
  return fragmentTemplates.slice(0, 5).map((template, index) => ({
    id: `frag_inst_1_${index + 1}`,
    templateId: template.id,
    title: template.title,
    region: template.region,
    industry: template.industry,
    sourceType: template.sourceType,
    tags: template.tags,
    certainty: pickDeterministic(template.certainty, index),
    expiresIn: pickDeterministic(template.expires, index + 1),
    leadValue: template.leadValue,
    pinned: false,
    discoveredTurn: 1
  }));
}

export function createInitialState() {
  const marketRegions = Object.fromEntries(
    regions.map((region) => [region.id, createMarketMetrics(region)])
  );
  marketRegions.SEA.opportunityScore = 78;

  return {
    seed: "mvp-sea-001",
    turn: 1,
    maxTurns: 8,
    phase: "market_update",
    screen: "top",
    selectedDealId: null,
    selectedNegotiationId: null,
    selectedIncidentId: null,
    market: {
      year: 2026,
      regions: marketRegions,
      commodityPrices: { lng: 126, wheat: 97, copper: 104 },
      fxRates: { USDJPY: 148.2 },
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
      yearlyFocus: "network",
      regionalTrust: { Japan: 1, SEA: 2, MiddleEast: 0 },
      partnerRelations: Object.fromEntries(
        partners.map((partner) => [partner.id, partner.relationshipBase])
      ),
      staff: {
        originator: { total: 2, assigned: 0, fatigue: 0 },
        bizdev: { total: 2, assigned: 0, fatigue: 0 },
        finance: { total: 1, assigned: 0, fatigue: 0 },
        legal: { total: 1, assigned: 0, fatigue: 0 },
        ops: { total: 1, assigned: 0, fatigue: 0 },
        gov: { total: 1, assigned: 0, fatigue: 0 }
      },
      infoNetwork: {
        Japan: { energy: 1, food: 1 },
        SEA: { energy: 2, food: 1, infrastructure: 1 },
        MiddleEast: { energy: 1 }
      },
      ownedAssets: ["asset_sea_port_terminal"]
    },
    fragments: createInitialFragments(),
    leads: [],
    deals: [],
    negotiations: [],
    approvals: [],
    incidents: [],
    messages: [
      {
        id: "msg_init",
        title: "東南アジアで案件機会が拡大",
        body: "電力需要と港湾ボトルネックの両方が顕在化しています。まずは情報収集から案件化につなげてください。",
        level: "info"
      }
    ]
  };
}

export function loadState() {
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return createInitialState();
  try {
    return JSON.parse(raw);
  } catch {
    return createInitialState();
  }
}

export function saveState(state) {
  window.localStorage.setItem(storageKey, JSON.stringify(state));
}

export function resetState() {
  const next = createInitialState();
  saveState(next);
  return next;
}

export function addMessage(state, title, body, level = "info") {
  state.messages.push({
    id: `msg_${state.turn}_${state.messages.length + 1}`,
    title,
    body,
    level
  });
}

export function setScreen(state, screen, extra = {}) {
  state.screen = screen;
  Object.assign(state, extra);
  saveState(state);
}

export function advancePhase(state) {
  const index = phaseOrder.indexOf(state.phase);
  state.phase = phaseOrder[(index + 1) % phaseOrder.length];
  addMessage(state, "フェーズ移行", `${state.phase} フェーズに進みました。`);
  saveState(state);
}

export function runIntelligenceSweep(state) {
  if (state.player.actionsRemaining <= 0) {
    addMessage(state, "行動不足", "今期のアクションが足りません。", "warning");
    saveState(state);
    return;
  }

  const baseIndex = state.fragments.length;
  const newFragments = [];
  for (let i = 0; i < 3; i += 1) {
    const template = fragmentTemplates[(baseIndex + i) % fragmentTemplates.length];
    newFragments.push({
      id: `frag_inst_${state.turn}_${baseIndex + i + 1}`,
      templateId: template.id,
      title: template.title,
      region: template.region,
      industry: template.industry,
      sourceType: template.sourceType,
      tags: template.tags,
      certainty: pickDeterministic(template.certainty, baseIndex + i),
      expiresIn: pickDeterministic(template.expires, baseIndex + i + 1),
      leadValue: template.leadValue,
      pinned: false,
      discoveredTurn: state.turn
    });
  }

  state.fragments.push(...newFragments);
  state.player.actionsRemaining -= 1;
  state.phase = "lead_discovery";
  state.screen = "inbox";
  addMessage(state, "情報収集完了", `${newFragments.length}件の新規断片情報を獲得しました。`);
  saveState(state);
}

export function togglePinFragment(state, fragmentId) {
  const fragment = state.fragments.find((entry) => entry.id === fragmentId);
  if (!fragment) return;
  fragment.pinned = !fragment.pinned;
  saveState(state);
}

export function deriveLeadCandidates(state) {
  const pinned = state.fragments.filter((fragment) => fragment.pinned);
  const fragments = pinned.length > 0 ? pinned : state.fragments;
  const candidates = [];

  dealTemplates.forEach((template) => {
    const grouped = new Map();

    fragments.forEach((fragment) => {
      const compatible =
        fragment.industry === template.industry ||
        fragment.tags.some((tag) => template.mandatoryTags.includes(tag));
      if (!compatible) return;
      const key = fragment.region;
      const current = grouped.get(key) ?? [];
      current.push(fragment);
      grouped.set(key, current);
    });

    grouped.forEach((group, regionId) => {
      const tagSet = new Set(group.flatMap((fragment) => fragment.tags));
      const hasNeed = tagSet.has("need");
      const hasSupport =
        tagSet.has("finance") || tagSet.has("access") || tagSet.has("partner");

      if (!hasNeed || !hasSupport) return;

      const certaintyScore = group.reduce(
        (sum, fragment) => sum + fragment.certainty * 4 + fragment.leadValue * 3,
        0
      );
      const mandatoryHits = template.mandatoryTags.filter((tag) => tagSet.has(tag));
      const optionalHits = template.optionalTags.filter((tag) => tagSet.has(tag));
      const missingNeeds = [];
      if (!tagSet.has("finance")) missingNeeds.push("finance");
      if (!tagSet.has("partner")) missingNeeds.push("localPartner");
      if (!(tagSet.has("access") || tagSet.has("government_access"))) {
        missingNeeds.push("permit");
      }

      const score = Math.min(
        96,
        18 +
          certaintyScore +
          mandatoryHits.length * 18 +
          optionalHits.length * 6 +
          (hasNeed ? 12 : 0) +
          (tagSet.has("finance") ? 10 : 0) +
          (tagSet.has("access") || tagSet.has("government_access") ? 8 : 0)
      );

      if (score < 42) return;

      candidates.push({
        id: `cand_${template.id}_${regionId}`,
        templateId: template.id,
        name: `${regionName(regionId)} ${template.name}`,
        region: regionId,
        industry: template.industry,
        fragmentIds: group.map((fragment) => fragment.id),
        score,
        missingNeeds,
        rationale: [
          `${mandatoryHits.length}/${template.mandatoryTags.length} の必須条件が見えている`,
          `${group.length} 枚の断片情報が同一仮説に収束している`
        ]
      });
    });
  });

  return candidates.sort((a, b) => b.score - a.score);
}

function getDealTemplate(templateId) {
  return dealTemplates.find((template) => template.id === templateId);
}

export function createDealFromCandidate(state, candidateId) {
  const candidate = deriveLeadCandidates(state).find((entry) => entry.id === candidateId);
  if (!candidate) return;

  const template = getDealTemplate(candidate.templateId);
  if (!template) return;

  const leadId = `lead_${Date.now()}`;
  state.leads.push({
    id: leadId,
    name: candidate.name,
    region: candidate.region,
    industry: candidate.industry,
    fragmentIds: candidate.fragmentIds,
    templateId: candidate.templateId,
    score: candidate.score
  });

  const deal = {
    id: `deal_${Date.now()}`,
    name: candidate.name,
    templateId: candidate.templateId,
    region: candidate.region,
    industry: candidate.industry,
    stage: "structuring",
    sourceLeadId: leadId,
    slotAssignments: {},
    contractTerms: {
      equitySharePlayer: 35,
      controlLevel: 2,
      localContentRatio: 30,
      offtakeYears: 10,
      esgMitigationBudget: 6,
      exitOption: true
    },
    capex: template.baseCapex,
    equityRequired: template.baseCapex * template.baseEquityRatio,
    debtRatio: 1 - template.baseEquityRatio,
    expectedIrr: template.baseIrr,
    approvalDifficulty: 72,
    structureScore: 0,
    riskExposure: { ...template.riskWeights },
    synergyTags: [...template.synergyTags],
    timeline: {
      createdTurn: state.turn,
      targetOperateIn: template.timeToOperate
    },
    history: [
      {
        turn: state.turn,
        type: "create",
        message: "リードから案件化された"
      }
    ]
  };

  state.deals.push(recomputeDeal(state, deal));
  state.selectedDealId = deal.id;
  state.screen = "deal";
  state.phase = "deal_structuring";
  addMessage(state, "案件組成開始", `${candidate.name} の案件キャンバスを開きました。`);
  saveState(state);
}

export function getLeadFragments(state, deal) {
  const lead = state.leads.find((entry) => entry.id === deal.sourceLeadId);
  if (!lead) return [];
  return state.fragments.filter((fragment) => lead.fragmentIds.includes(fragment.id));
}

export function getSlotSuggestions(state, deal, slotId) {
  const hints = slotHints[slotId] ?? [];
  const leadFragments = getLeadFragments(state, deal);
  return {
    fragments: leadFragments.filter((fragment) =>
      fragment.tags.some((tag) => hints.includes(tag))
    ),
    partners: partners.filter(
      (partner) =>
        partner.offerableSlots.includes(slotId) &&
        partner.regions.includes(deal.region) &&
        partner.industries.includes(deal.industry)
    )
  };
}

export function computeDealView(state, deal) {
  const template = getDealTemplate(deal.templateId);
  const filledSlots = template.requiredSlots.filter((slotId) => deal.slotAssignments[slotId]);
  const unresolvedRisks = [];

  if (!deal.slotAssignments.finance) unresolvedRisks.push("資金調達の裏付けが弱い");
  if (!deal.slotAssignments.localPartner) unresolvedRisks.push("現地パートナー不在");
  if (!deal.slotAssignments.logistics && template.requiredSlots.includes("logistics")) {
    unresolvedRisks.push("物流ボトルネックが未解決");
  }
  if (deal.contractTerms.esgMitigationBudget < 8) unresolvedRisks.push("ESG対策が薄い");

  const financeSlot = deal.slotAssignments.finance;
  const financeRelation = financeSlot
    ? state.player.partnerRelations[financeSlot.refId] ?? 0
    : 0;
  const fundingViabilityScore = clamp(
    28 +
      financeRelation * 8 +
      (state.player.creditStrength + state.player.hqReputation) * 6 -
      deal.equityRequired * 0.12,
    0,
    100
  );

  const synergyPreview = [];
  if (
    deal.synergyTags.includes("sea_logistics") &&
    state.player.ownedAssets.includes("asset_sea_port_terminal")
  ) {
    synergyPreview.push("港湾アセットと接続して物流救済ルートが開く");
  }
  if (deal.synergyTags.includes("power")) {
    synergyPreview.push("電力案件の実績が次の送配電案件の稟議を軽くする");
  }

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
      state.player.hqReputation * 2 +
      state.player.esgScore * 0.18 -
      deal.approvalDifficulty * 0.5,
    0,
    100
  );

  return {
    structureScore,
    slotCompletionRate: filledSlots.length / template.requiredSlots.length,
    fundingViabilityScore,
    unresolvedRisks,
    synergyPreview,
    approvalPreview
  };
}

export function recomputeDeal(state, deal) {
  const view = computeDealView(state, deal);
  return {
    ...deal,
    structureScore: view.structureScore,
    expectedIrr: clamp(
      getDealTemplate(deal.templateId).baseIrr +
        view.slotCompletionRate * 7 +
        deal.contractTerms.controlLevel * 1.5 +
        view.synergyPreview.length * 1.2,
      6,
      22
    ),
    approvalDifficulty: clamp(
      88 -
        view.slotCompletionRate * 32 -
        state.player.hqReputation * 2 +
        view.unresolvedRisks.length * 4,
      20,
      95
    )
  };
}

export function assignFragmentToSlot(state, dealId, slotId, fragmentId) {
  const deal = state.deals.find((entry) => entry.id === dealId);
  const fragment = state.fragments.find((entry) => entry.id === fragmentId);
  if (!deal || !fragment) return;
  deal.slotAssignments[slotId] = {
    kind: "fragment",
    refId: fragmentId,
    quality: fragment.certainty * 20
  };
  Object.assign(deal, recomputeDeal(state, deal));
  saveState(state);
}

export function assignPartnerToSlot(state, dealId, slotId, partnerId) {
  const deal = state.deals.find((entry) => entry.id === dealId);
  if (!deal) return;
  const relation = state.player.partnerRelations[partnerId] ?? 0;
  deal.slotAssignments[slotId] = {
    kind: "partner",
    refId: partnerId,
    quality: 48 + relation * 12
  };
  Object.assign(deal, recomputeDeal(state, deal));
  saveState(state);
}

export function openNegotiation(state, dealId, slotId, partnerId) {
  const session = {
    id: `nego_${Date.now()}`,
    dealId,
    partnerId,
    requestedSlot: slotId,
    round: 1,
    maxRounds: 3,
    topic: "pricing",
    proposedTerms: [],
    concessions: [],
    acceptancePreview: 0,
    status: "open",
    log: []
  };
  state.negotiations.push(session);
  state.selectedNegotiationId = session.id;
  state.screen = "negotiation";
  state.phase = "negotiation";
  addMessage(state, "交渉開始", `${slotId} スロットについて交渉を開始しました。`);
  saveState(state);
}

const offerEffectMap = {
  pricing: { yield: 12, price: 12 },
  guarantee: { safety: 16 },
  board_seat: { control: 8, prestige: 10 },
  local_content: { local_content: 12, prestige: 4 },
  offtake_floor: { safety: 12, yield: 6 },
  esg_mitigation: { esg: 12 },
  long_tenor: { safety: 10 },
  operating_control: { control: 14 }
};

export function evaluateNegotiation(partner, relationship, topic, offers, concession) {
  let score = 24 + relationship * 8;
  const notes = [`相手の重視軸: ${Object.keys(partner.preferenceWeights).join(", ")}`];

  if (partner.negotiationTopics.includes(topic)) {
    score += 10;
    notes.push(`議題 ${topic} は相手の関心領域に合っている`);
  } else {
    score -= 4;
  }

  offers.forEach((offer) => {
    const effect = offerEffectMap[offer];
    if (!effect) return;
    Object.entries(effect).forEach(([key, weight]) => {
      score += (partner.preferenceWeights[key] ?? 0) * (weight / 10);
    });
  });

  if (concession) {
    const effect = offerEffectMap[concession];
    if (effect) {
      Object.entries(effect).forEach(([key, weight]) => {
        score += (partner.preferenceWeights[key] ?? 0) * (weight / 12);
      });
    }
    notes.push(`譲歩 ${concession} を示したため関係値が改善しやすい`);
  }

  partner.redLines.forEach((redLine) => {
    if (offers.includes(redLine)) {
      score -= 16;
      notes.push(`red line ${redLine} に触れている`);
    }
  });

  if (partner.hiddenTraits.includes("prestige_sensitive") && concession === "board_seat") {
    score += 10;
  }

  const acceptance = clamp(score, 0, 100);

  return {
    acceptance,
    notes,
    relationshipDelta: acceptance >= 70 ? 1 : acceptance >= 50 ? 0 : -1,
    slotQuality: clamp(acceptance - 5, 0, 100),
    agreed: acceptance >= 70
  };
}

export function submitNegotiationOffer(state, sessionId, topic, offers, concession) {
  const session = state.negotiations.find((entry) => entry.id === sessionId);
  if (!session) return;
  const partner = partners.find((entry) => entry.id === session.partnerId);
  const deal = state.deals.find((entry) => entry.id === session.dealId);
  if (!partner || !deal) return;

  const relationship = state.player.partnerRelations[partner.id] ?? partner.relationshipBase;
  const preview = evaluateNegotiation(partner, relationship, topic, offers, concession);

  session.topic = topic;
  session.proposedTerms = offers;
  session.concessions = concession ? [concession] : [];
  session.acceptancePreview = preview.acceptance;
  session.log.push({
    round: session.round,
    text: preview.notes.join(" / ")
  });

  state.player.partnerRelations[partner.id] = clamp(
    relationship + preview.relationshipDelta,
    -2,
    5
  );

  if (preview.agreed) {
    session.status = "agreed";
    deal.slotAssignments[session.requestedSlot] = {
      kind: "partner",
      refId: partner.id,
      quality: preview.slotQuality
    };
    Object.assign(deal, recomputeDeal(state, deal));
    state.screen = "deal";
    addMessage(state, "交渉妥結", `${partner.name} と ${session.requestedSlot} の条件で合意しました。`);
  } else {
    session.round += 1;
    session.status = session.round > session.maxRounds ? "stalled" : "open";
    addMessage(state, "交渉継続", `${partner.name} との条件調整が続いています。`, "warning");
  }

  saveState(state);
}

function compare(op, left, right) {
  if (op === "lt") return left < right;
  if (op === "lte") return left <= right;
  if (op === "gt") return left > right;
  if (op === "gte") return left >= right;
  return left === right;
}

export function computeApproval(state, deal) {
  const departmentScores = {};
  const vetoMessages = [];
  const recommendedActions = [];
  const riskExposure = Object.values(deal.riskExposure).reduce((sum, value) => sum + value, 0);
  const metrics = {
    expectedIrr: deal.expectedIrr,
    paybackYears: Math.max(2, 10 - deal.expectedIrr / 2),
    equityRequired: deal.equityRequired,
    cashBufferAfterInvestment: state.player.cash - deal.equityRequired,
    structureScore: deal.structureScore,
    esgScore: state.player.esgScore,
    riskExposure
  };

  approvalRules.forEach((rule) => {
    let score = 50;
    Object.entries(rule.weights).forEach(([key, weight]) => {
      score += (metrics[key] ?? 0) * weight;
    });
    departmentScores[rule.id] = clamp(score, 0, 100);

    rule.vetoRules.forEach((veto) => {
      if (compare(veto.op, metrics[veto.key] ?? 0, veto.value)) {
        vetoMessages.push(`${rule.label}: ${veto.message}`);
      }
    });
  });

  if (departmentScores.esg < 60) recommendedActions.push("ESG対策予算を積み増す");
  if (departmentScores.risk < 60) recommendedActions.push("代替物流・ヘッジ条件を追加する");
  if (departmentScores.finance < 60) recommendedActions.push("自己資本比率か回収構造を見直す");

  const average =
    Object.values(departmentScores).reduce((sum, value) => sum + value, 0) /
    Object.values(departmentScores).length;
  const status =
    vetoMessages.length > 0 ? "rejected" : average >= 72 ? "approved" : average >= 58 ? "conditional" : "rejected";

  return {
    id: `approval_${deal.id}`,
    dealId: deal.id,
    submittedTurn: state.turn,
    departmentScores,
    vetoMessages,
    recommendedActions,
    status
  };
}

export function submitApproval(state, dealId) {
  const deal = state.deals.find((entry) => entry.id === dealId);
  if (!deal || state.player.approvalsRemaining <= 0) return;
  const approval = computeApproval(state, deal);
  state.approvals = state.approvals.filter((entry) => entry.dealId !== dealId);
  state.approvals.push(approval);
  state.player.approvalsRemaining -= 1;
  state.phase = "approval";
  state.screen = "approval";
  state.selectedDealId = dealId;

  if (approval.status === "approved") {
    deal.stage = "approved";
    state.player.hqReputation += 1;
    addMessage(state, "稟議承認", `${deal.name} が正式承認されました。`);
  } else if (approval.status === "conditional") {
    deal.stage = "approval_pending";
    addMessage(state, "条件付き承認", `${deal.name} は条件付きで継続審査となりました。`, "warning");
  } else {
    deal.stage = "structuring";
    state.player.hqReputation -= 1;
    addMessage(state, "稟議差し戻し", `${deal.name} は社内論点の解消が必要です。`, "critical");
  }

  saveState(state);
}

export function computePortfolio(state) {
  const activeDeals = state.deals.filter((deal) => deal.stage !== "terminated" && deal.stage !== "divested");
  const cashFlowProjection = activeDeals.reduce(
    (sum, deal) => sum + (deal.operatingMetrics?.ebitda ?? deal.expectedIrr),
    0
  );
  const concentrationRiskScore = clamp(
    activeDeals.filter((deal) => deal.region === "SEA").length * 12 +
      activeDeals.filter((deal) => deal.industry === "energy").length * 10,
    0,
    100
  );

  const synergyEdges = [];
  activeDeals.forEach((deal) => {
    activeDeals.forEach((other) => {
      if (deal.id === other.id) return;
      const shared = deal.synergyTags.find((tag) => other.synergyTags.includes(tag));
      if (!shared) return;
      synergyEdges.push({
        fromDealId: deal.id,
        toDealId: other.id,
        type: deal.region === other.region ? "regional" : "vertical",
        value: 12,
        shared
      });
    });
  });

  return {
    activeDeals,
    cashFlowProjection,
    concentrationRiskScore,
    synergyEdges,
    corporateValueScore: clamp(
      state.player.cash +
        cashFlowProjection * 2 +
        synergyEdges.length * 8 +
        state.player.hqReputation * 6 -
        concentrationRiskScore,
      0,
      999
    )
  };
}

export function triggerRiskIncident(state) {
  const template = riskTemplates[state.turn % riskTemplates.length];
  const incident = {
    id: `incident_${Date.now()}`,
    templateId: template.id,
    name: template.name,
    category: template.category,
    severity: 2 + (state.turn % 2),
    targetDealIds: state.deals.slice(0, 2).map((deal) => deal.id),
    responseOptions: template.responseOptions.map((option) => ({ ...option })),
    resolved: false
  };

  state.incidents.push(incident);
  state.selectedIncidentId = incident.id;
  state.screen = "risk";
  state.phase = "risk_response";
  addMessage(state, "リスク発生", template.name, "critical");
  saveState(state);
}

export function resolveRiskIncident(state, incidentId, responseId) {
  const incident = state.incidents.find((entry) => entry.id === incidentId);
  if (!incident) return;
  const response = incident.responseOptions.find((entry) => entry.id === responseId);
  if (!response) return;

  state.player.cash -= response.cashImpact;
  state.player.esgScore += response.esgImpact;
  state.player.hqReputation += response.trustImpact > 0 ? 1 : 0;
  incident.resolved = true;
  state.screen = "portfolio";
  addMessage(state, "危機対応完了", `${response.label} を実行しました。`, "warning");
  saveState(state);
}

export function chooseYearlyFocus(state, focus) {
  state.player.yearlyFocus = focus;
  saveState(state);
}

export function advanceYear(state) {
  state.turn += 1;
  state.market.year += 1;
  state.phase = "market_update";
  state.screen = "map";
  state.player.actionsRemaining = state.player.yearlyActionBudget;
  state.player.approvalsRemaining = state.player.yearlyApprovalSlots;
  state.player.emergencyActionsRemaining = 1;
  state.player.cash += Math.round(computePortfolio(state).cashFlowProjection * 0.8);
  state.fragments.forEach((fragment) => {
    fragment.expiresIn -= 1;
  });
  state.fragments = state.fragments.filter((fragment) => fragment.expiresIn > 0);
  state.market.regions.SEA.opportunityScore = clamp(
    state.market.regions.SEA.opportunityScore + (Math.random() > 0.5 ? 4 : -4),
    50,
    90
  );
  state.market.regions.SEA.riskScore = clamp(
    state.market.regions.SEA.riskScore + (Math.random() > 0.5 ? 6 : -5),
    20,
    85
  );
  addMessage(state, `年度更新 ${state.market.year}`, "行動回数と承認枠がリフレッシュされました。");
  saveState(state);
}

export function getSelectedDeal(state) {
  return state.deals.find((deal) => deal.id === state.selectedDealId) ?? state.deals[0] ?? null;
}

export function getSelectedNegotiation(state) {
  return (
    state.negotiations.find((session) => session.id === state.selectedNegotiationId) ??
    state.negotiations[state.negotiations.length - 1] ??
    null
  );
}

export function getSelectedApproval(state) {
  const deal = getSelectedDeal(state);
  if (!deal) return null;
  return state.approvals.find((approval) => approval.dealId === deal.id) ?? null;
}

export function getSelectedIncident(state) {
  return (
    state.incidents.find((incident) => incident.id === state.selectedIncidentId) ??
    state.incidents.find((incident) => !incident.resolved) ??
    null
  );
}

export { partners, dealTemplates };
