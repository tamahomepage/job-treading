import { z } from "zod";

const regionIdSchema = z.enum(["Japan", "SEA", "MiddleEast"]);
const industryIdSchema = z.enum([
  "energy",
  "food",
  "mobility",
  "infrastructure"
]);
const dealSlotIdSchema = z.enum([
  "demand",
  "technology",
  "localPartner",
  "finance",
  "permit",
  "logistics",
  "offtake",
  "operator"
]);
const partnerTypeSchema = z.enum([
  "government",
  "state_owned",
  "local_company",
  "conglomerate",
  "manufacturer",
  "bank",
  "fund",
  "logistics",
  "offtaker",
  "hq_department"
]);
const fragmentTagSchema = z.enum([
  "need",
  "supply",
  "finance",
  "access",
  "partner",
  "risk",
  "power",
  "food_security",
  "port",
  "grid",
  "demand_growth",
  "subsidy",
  "logistics_bottleneck",
  "government_access",
  "fuel_import",
  "cold_chain",
  "distribution",
  "manufacturer_capacity",
  "permit"
]);
const eventCategorySchema = z.enum([
  "market",
  "geopolitics",
  "regulation",
  "fx",
  "supply_chain",
  "accident",
  "esg",
  "natural_disaster",
  "partner_scandal"
]);

export const regionDefinitionSchema = z.object({
  id: regionIdSchema,
  name: z.string(),
  demandGrowthBase: z.record(z.string(), z.number()),
  politicalRiskBase: z.number(),
  fxVolatilityBase: z.number(),
  permitDifficultyBase: z.number(),
  disasterRiskBase: z.number(),
  baseTrust: z.number(),
  preferredPartnerTypes: z.array(partnerTypeSchema),
  specialTags: z.array(z.string())
});

export const industryDefinitionSchema = z.object({
  id: industryIdSchema,
  name: z.string(),
  capitalIntensity: z.number(),
  baseReturnMin: z.number(),
  baseReturnMax: z.number(),
  esgSensitivity: z.number(),
  templateIds: z.array(z.string()),
  synergyFamilies: z.array(z.string())
});

export const fragmentTemplateSchema = z.object({
  id: z.string(),
  title: z.string(),
  regionPool: z.array(regionIdSchema),
  industryPool: z.array(industryIdSchema),
  sourceType: z.string(),
  tags: z.array(fragmentTagSchema),
  certaintyRange: z.tuple([z.number(), z.number()]),
  expiryRange: z.tuple([z.number(), z.number()]),
  weightRules: z.array(
    z.object({
      when: z.string(),
      bonus: z.number()
    })
  ),
  leadValue: z.number()
});

export const dealTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  industry: industryIdSchema,
  requiredSlots: z.array(dealSlotIdSchema),
  mandatoryTags: z.array(z.string()),
  optionalTags: z.array(z.string()),
  baseCapex: z.number(),
  baseEquityRatio: z.number(),
  baseIrr: z.number(),
  timeToOperate: z.number(),
  riskWeights: z.record(z.string(), z.number()),
  synergyTags: z.array(z.string()),
  unlockRules: z.array(
    z.object({
      anyOfTags: z.array(z.string()).optional(),
      allOfTags: z.array(z.string()).optional(),
      regionIds: z.array(regionIdSchema).optional()
    })
  )
});

export const partnerDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: partnerTypeSchema,
  regions: z.array(regionIdSchema),
  industries: z.array(industryIdSchema),
  capabilityTags: z.array(z.string()),
  offerableSlots: z.array(dealSlotIdSchema),
  preferenceWeights: z.record(z.string(), z.number()),
  relationshipBase: z.number(),
  redLines: z.array(z.string()),
  hiddenTraits: z.array(z.string()),
  negotiationTopics: z.array(z.string())
});

export const eventTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: eventCategorySchema,
  triggerRules: z.object({
    minTurn: z.number().optional(),
    regionIds: z.array(regionIdSchema).optional(),
    industries: z.array(industryIdSchema).optional(),
    requiredExposureTags: z.array(z.string()).optional(),
    macroFlags: z.array(z.string()).optional()
  }),
  severityBase: z.number(),
  targetRules: z.object({
    regionIds: z.array(regionIdSchema).optional(),
    industries: z.array(industryIdSchema).optional(),
    dealTags: z.array(z.string()).optional()
  }),
  immediateEffects: z.array(
    z.object({
      key: z.string(),
      value: z.number()
    })
  ),
  responseOptions: z.array(z.string()),
  upsideUnlocks: z.array(z.string()).optional()
});

export const approvalDepartmentRuleSchema = z.object({
  id: z.enum(["finance", "risk", "legal", "esg", "management", "business_unit"]),
  displayName: z.string(),
  weights: z.record(z.string(), z.number()),
  vetoRules: z.array(
    z.object({
      key: z.string(),
      op: z.enum(["gt", "gte", "lt", "lte", "eq"]),
      value: z.number(),
      message: z.string()
    })
  )
});
