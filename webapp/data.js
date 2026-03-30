export const regions = [
  {
    id: "Japan",
    name: "日本",
    demandGrowth: { energy: 1, food: 1, mobility: 1, infrastructure: 1 },
    politicalRisk: 1,
    fxVolatility: 1,
    permitDifficulty: 2,
    disasterRisk: 2,
    baseTrust: 2
  },
  {
    id: "SEA",
    name: "東南アジア",
    demandGrowth: { energy: 4, food: 3, mobility: 4, infrastructure: 5 },
    politicalRisk: 2,
    fxVolatility: 3,
    permitDifficulty: 3,
    disasterRisk: 4,
    baseTrust: 1
  },
  {
    id: "MiddleEast",
    name: "中東",
    demandGrowth: { energy: 3, food: 2, mobility: 2, infrastructure: 3 },
    politicalRisk: 4,
    fxVolatility: 2,
    permitDifficulty: 2,
    disasterRisk: 1,
    baseTrust: 0
  }
];

export const dealTemplates = [
  {
    id: "gas_to_power",
    name: "LNG to Power",
    industry: "energy",
    requiredSlots: [
      "demand",
      "technology",
      "localPartner",
      "finance",
      "permit",
      "logistics",
      "offtake",
      "operator"
    ],
    mandatoryTags: ["power", "government_access"],
    optionalTags: ["finance", "port", "subsidy", "partner", "fuel_import"],
    baseCapex: 180,
    baseEquityRatio: 0.25,
    baseIrr: 11,
    timeToOperate: 2,
    riskWeights: {
      fx: 3,
      regulation: 3,
      supply_chain: 4,
      esg: 3
    },
    synergyTags: ["lng", "power", "grid", "sea_logistics"]
  },
  {
    id: "t_and_d_upgrade",
    name: "送配電更新",
    industry: "energy",
    requiredSlots: [
      "demand",
      "technology",
      "localPartner",
      "finance",
      "permit",
      "operator"
    ],
    mandatoryTags: ["grid"],
    optionalTags: ["subsidy", "government_access", "partner"],
    baseCapex: 95,
    baseEquityRatio: 0.3,
    baseIrr: 10,
    timeToOperate: 2,
    riskWeights: {
      fx: 2,
      regulation: 2,
      supply_chain: 2,
      esg: 1
    },
    synergyTags: ["power", "grid"]
  },
  {
    id: "grain_cold_chain",
    name: "穀物輸入 + コールドチェーン",
    industry: "food",
    requiredSlots: [
      "demand",
      "localPartner",
      "finance",
      "permit",
      "logistics",
      "operator"
    ],
    mandatoryTags: ["food_security", "cold_chain"],
    optionalTags: ["partner", "distribution", "port"],
    baseCapex: 72,
    baseEquityRatio: 0.35,
    baseIrr: 12,
    timeToOperate: 1,
    riskWeights: {
      fx: 2,
      supply_chain: 3,
      esg: 2
    },
    synergyTags: ["grain", "distribution", "cold_chain", "sea_logistics"]
  }
];

export const fragmentTemplates = [
  {
    id: "frag_vn_power_demand",
    title: "ベトナム南部で電力需要が急増",
    region: "SEA",
    industry: "energy",
    sourceType: "government",
    tags: ["need", "power", "demand_growth"],
    certainty: [2, 4],
    expires: [2, 3],
    leadValue: 2
  },
  {
    id: "frag_sg_bank_lending",
    title: "シンガポール系銀行がインフラ融資先を探索",
    region: "SEA",
    industry: "energy",
    sourceType: "bank",
    tags: ["finance"],
    certainty: [2, 3],
    expires: [2, 4],
    leadValue: 2
  },
  {
    id: "frag_transition_subsidy",
    title: "移行電源向け補助金制度が拡充",
    region: "SEA",
    industry: "energy",
    sourceType: "government",
    tags: ["access", "subsidy", "government_access", "permit"],
    certainty: [2, 4],
    expires: [2, 3],
    leadValue: 2
  },
  {
    id: "frag_port_bottleneck",
    title: "港湾混雑が慢性化し、輸入燃料と食料に遅延懸念",
    region: "SEA",
    industry: "energy",
    sourceType: "trade_media",
    tags: ["risk", "port", "logistics_bottleneck"],
    certainty: [1, 3],
    expires: [2, 4],
    leadValue: 1
  },
  {
    id: "frag_jp_transformer_supply",
    title: "日本メーカーが大型変圧器の海外案件を探している",
    region: "Japan",
    industry: "energy",
    sourceType: "manufacturer",
    tags: ["supply", "grid", "manufacturer_capacity"],
    certainty: [2, 3],
    expires: [3, 4],
    leadValue: 2
  },
  {
    id: "frag_local_conglomerate_land",
    title: "現地財閥が港湾近接地を持ち、JVパートナーを模索",
    region: "SEA",
    industry: "energy",
    sourceType: "local_conglomerate",
    tags: ["partner", "access"],
    certainty: [2, 4],
    expires: [2, 3],
    leadValue: 2
  },
  {
    id: "frag_id_cold_chain_gap",
    title: "インドネシアでコールドチェーン不足が顕在化",
    region: "SEA",
    industry: "food",
    sourceType: "trade_media",
    tags: ["need", "food_security", "cold_chain", "distribution"],
    certainty: [2, 4],
    expires: [3, 4],
    leadValue: 2
  }
];

export const partners = [
  {
    id: "partner_sg_project_bank",
    name: "Singapore Project Bank",
    type: "bank",
    regions: ["SEA", "MiddleEast"],
    industries: ["energy", "infrastructure"],
    offerableSlots: ["finance"],
    preferenceWeights: { safety: 5, yield: 2, esg: 3, control: 1 },
    relationshipBase: 1,
    redLines: ["unhedged_fx", "weak_offtake"],
    hiddenTraits: ["likes_export_credit_support"],
    negotiationTopics: ["pricing", "guarantee", "long_tenor"]
  },
  {
    id: "partner_vn_state_utility",
    name: "Vietnam State Utility",
    type: "state_owned",
    regions: ["SEA"],
    industries: ["energy", "infrastructure"],
    offerableSlots: ["offtake", "operator"],
    preferenceWeights: { safety: 4, price: 4, local_content: 3, control: 2 },
    relationshipBase: 1,
    redLines: ["operating_control"],
    hiddenTraits: ["prestige_sensitive"],
    negotiationTopics: ["pricing", "local_content", "guarantee"]
  },
  {
    id: "partner_jp_transformer",
    name: "Japan Transformer Co",
    type: "manufacturer",
    regions: ["Japan", "SEA", "MiddleEast"],
    industries: ["energy"],
    offerableSlots: ["technology"],
    preferenceWeights: { yield: 3, control: 1, safety: 2, esg: 1 },
    relationshipBase: 2,
    redLines: ["local_content"],
    hiddenTraits: [],
    negotiationTopics: ["pricing", "guarantee"]
  },
  {
    id: "partner_sea_conglomerate",
    name: "SEA Coastal Conglomerate",
    type: "conglomerate",
    regions: ["SEA"],
    industries: ["energy", "food", "infrastructure"],
    offerableSlots: ["localPartner", "logistics"],
    preferenceWeights: { control: 5, prestige: 4, yield: 3, local_content: 2 },
    relationshipBase: 1,
    redLines: ["operating_control"],
    hiddenTraits: ["prestige_sensitive"],
    negotiationTopics: ["board_seat", "pricing", "local_content"]
  },
  {
    id: "partner_port_operator",
    name: "Maritime Terminal Operator",
    type: "logistics",
    regions: ["SEA", "MiddleEast"],
    industries: ["energy", "food", "infrastructure"],
    offerableSlots: ["logistics", "operator"],
    preferenceWeights: { yield: 3, safety: 2, control: 2, local_content: 1 },
    relationshipBase: 0,
    redLines: [],
    hiddenTraits: [],
    negotiationTopics: ["pricing", "operating_control"]
  },
  {
    id: "partner_food_distributor",
    name: "Archipelago Food Distributor",
    type: "local_company",
    regions: ["SEA"],
    industries: ["food"],
    offerableSlots: ["localPartner", "offtake", "operator", "logistics"],
    preferenceWeights: { yield: 3, control: 2, safety: 2, local_content: 3 },
    relationshipBase: 1,
    redLines: [],
    hiddenTraits: [],
    negotiationTopics: ["pricing", "local_content", "offtake_floor"]
  }
];

export const approvalRules = [
  {
    id: "finance",
    label: "Finance",
    weights: {
      expectedIrr: 4,
      paybackYears: -3,
      equityRequired: -1,
      cashBufferAfterInvestment: 2
    },
    vetoRules: [
      {
        key: "cashBufferAfterInvestment",
        op: "lt",
        value: 15,
        message: "投資後のキャッシュバッファが薄すぎます。"
      }
    ]
  },
  {
    id: "risk",
    label: "Risk Management",
    weights: {
      riskExposure: -3,
      structureScore: 2,
      cashBufferAfterInvestment: 1
    },
    vetoRules: [
      {
        key: "riskExposure",
        op: "gt",
        value: 18,
        message: "リスク露出が許容上限を超えています。"
      }
    ]
  },
  {
    id: "legal",
    label: "Legal",
    weights: { structureScore: 2, riskExposure: -1 },
    vetoRules: []
  },
  {
    id: "esg",
    label: "ESG",
    weights: { esgScore: 2, riskExposure: -1 },
    vetoRules: [
      {
        key: "esgScore",
        op: "lt",
        value: 45,
        message: "ESGスコアが低く、説明可能性が不足しています。"
      }
    ]
  },
  {
    id: "management",
    label: "Management",
    weights: { expectedIrr: 2, structureScore: 2, cashBufferAfterInvestment: 1 },
    vetoRules: []
  },
  {
    id: "business_unit",
    label: "Business Unit",
    weights: { structureScore: 3, expectedIrr: 1 },
    vetoRules: []
  }
];

export const riskTemplates = [
  {
    id: "evt_export_control",
    name: "輸出規制強化",
    category: "regulation",
    responseOptions: [
      {
        id: "contract_rebuild",
        label: "契約を再構築する",
        cashImpact: 8,
        delayImpact: 1,
        trustImpact: 1,
        esgImpact: 0
      },
      {
        id: "switch_supplier",
        label: "代替サプライヤーに切り替える",
        cashImpact: 15,
        delayImpact: 0,
        trustImpact: 0,
        esgImpact: 1
      },
      {
        id: "take_loss",
        label: "一部損失を受け入れて縮小する",
        cashImpact: 3,
        delayImpact: 0,
        trustImpact: -1,
        esgImpact: 0
      }
    ]
  },
  {
    id: "evt_partner_scandal",
    name: "現地パートナー不祥事",
    category: "partner_scandal",
    responseOptions: [
      {
        id: "replace_operator",
        label: "運営主体を切り替える",
        cashImpact: 10,
        delayImpact: 1,
        trustImpact: 1,
        esgImpact: 1
      },
      {
        id: "increase_governance",
        label: "監査・統治を強化する",
        cashImpact: 6,
        delayImpact: 0,
        trustImpact: 0,
        esgImpact: 2
      },
      {
        id: "take_loss",
        label: "持分縮小で損失を限定する",
        cashImpact: 4,
        delayImpact: 0,
        trustImpact: -1,
        esgImpact: 0
      }
    ]
  }
];

export const slotHints = {
  demand: ["need", "power", "food_security", "demand_growth"],
  technology: ["supply", "grid", "manufacturer_capacity"],
  localPartner: ["partner"],
  finance: ["finance"],
  permit: ["access", "government_access", "subsidy", "permit"],
  logistics: ["port", "distribution", "logistics_bottleneck"],
  offtake: ["partner", "distribution", "power", "food_security"],
  operator: ["distribution", "grid", "power"]
};

export const phaseOrder = [
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
