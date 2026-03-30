import { formatRegion } from "../../../shared/lib/formatters";
import type {
  DealTemplate,
  FragmentInstance,
  LeadCandidateView,
  MasterData
} from "../../models/types";

const hasAnyTag = (fragment: FragmentInstance, tags: string[]) =>
  tags.some((tag) => fragment.tags.includes(tag as never));

const scoreCandidate = (
  template: DealTemplate,
  fragments: FragmentInstance[]
): { score: number; missingNeeds: string[]; rationale: string[] } => {
  const certaintyScore = fragments.reduce(
    (sum, fragment) => sum + fragment.certainty * 4 + fragment.leadValue * 3,
    0
  );
  const tagSet = new Set<string>(fragments.flatMap((fragment) => fragment.tags));
  const mandatoryHits = template.mandatoryTags.filter((tag) => tagSet.has(tag));
  const optionalHits = template.optionalTags.filter((tag) => tagSet.has(tag));
  const hasNeed = tagSet.has("need");
  const hasFinance = tagSet.has("finance");
  const hasAccess = tagSet.has("access") || tagSet.has("government_access");
  const hasPartner = tagSet.has("partner");

  const missingNeeds: string[] = [];

  if (!hasFinance) {
    missingNeeds.push("finance");
  }
  if (!hasPartner) {
    missingNeeds.push("localPartner");
  }
  if (!hasAccess) {
    missingNeeds.push("permit");
  }

  const score = Math.min(
    96,
    18 +
      certaintyScore +
      mandatoryHits.length * 18 +
      optionalHits.length * 6 +
      (hasNeed ? 12 : 0) +
      (hasFinance ? 10 : 0) +
      (hasAccess ? 8 : 0)
  );

  const rationale = [
    `${mandatoryHits.length}/${template.mandatoryTags.length} の必須条件が見えている`,
    `${fragments.length} 枚の断片情報が同一仮説に収束している`
  ];

  if (optionalHits.length > 0) {
    rationale.push(`補助条件 ${optionalHits.join(", ")} が揃っている`);
  }

  return {
    score,
    missingNeeds,
    rationale
  };
};

export function deriveLeadCandidates(
  fragments: FragmentInstance[],
  data: MasterData
): LeadCandidateView[] {
  if (fragments.length === 0) {
    return [];
  }

  const candidates: LeadCandidateView[] = [];

  data.dealTemplates.forEach((template) => {
    const matchingFragments = fragments.filter(
      (fragment) =>
        fragment.industry === template.industry ||
        hasAnyTag(fragment, template.mandatoryTags)
    );

    const groupedByRegion = new Map<string, FragmentInstance[]>();

    matchingFragments.forEach((fragment) => {
      const current = groupedByRegion.get(fragment.region) ?? [];
      current.push(fragment);
      groupedByRegion.set(fragment.region, current);
    });

    groupedByRegion.forEach((group, region) => {
      const tagSet = new Set<string>(group.flatMap((fragment) => fragment.tags));
      const hasNeed = tagSet.has("need");
      const hasSupport =
        tagSet.has("finance") || tagSet.has("access") || tagSet.has("partner");

      if (!hasNeed || !hasSupport) {
        return;
      }

      const { score, missingNeeds, rationale } = scoreCandidate(template, group);

      if (score < 42) {
        return;
      }

      candidates.push({
        id: `cand_${template.id}_${region}`,
        name: `${formatRegion(region as never)} ${template.name}`,
        region: region as never,
        industry: template.industry,
        fragmentIds: group.map((fragment) => fragment.id),
        candidateTemplateIds: [template.id],
        score,
        missingNeeds,
        rationale
      });
    });
  });

  return candidates.sort((left, right) => right.score - left.score);
}
