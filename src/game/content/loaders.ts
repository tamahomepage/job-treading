import approvalRulesRaw from "../../content/approvalRules.json";
import dealTemplatesRaw from "../../content/dealTemplates.json";
import eventTemplatesRaw from "../../content/eventTemplates.json";
import fragmentTemplatesRaw from "../../content/fragmentTemplates.json";
import industriesRaw from "../../content/industries.json";
import partnersRaw from "../../content/partners.json";
import regionsRaw from "../../content/regions.json";
import type { MasterData } from "../models/types";
import {
  approvalDepartmentRuleSchema,
  dealTemplateSchema,
  eventTemplateSchema,
  fragmentTemplateSchema,
  industryDefinitionSchema,
  partnerDefinitionSchema,
  regionDefinitionSchema
} from "./schemas";

export const masterData: MasterData = {
  regions: regionDefinitionSchema.array().parse(regionsRaw),
  industries: industryDefinitionSchema.array().parse(industriesRaw),
  fragmentTemplates: fragmentTemplateSchema.array().parse(fragmentTemplatesRaw),
  dealTemplates: dealTemplateSchema.array().parse(dealTemplatesRaw),
  partners: partnerDefinitionSchema.array().parse(partnersRaw),
  eventTemplates: eventTemplateSchema.array().parse(eventTemplatesRaw),
  approvalRules: approvalDepartmentRuleSchema.array().parse(approvalRulesRaw)
};
