import { clamp } from "../../../shared/lib/formatters";
import type { PartnerDefinition } from "../../models/types";

export interface NegotiationPreview {
  acceptance: number;
  notes: string[];
  relationshipDelta: number;
  slotQuality: number;
  agreed: boolean;
}

const offerEffectMap: Record<string, Record<string, number>> = {
  pricing: { yield: 12, price: 12 },
  guarantee: { safety: 16 },
  board_seat: { control: 8, prestige: 10 },
  local_content: { local_content: 12, prestige: 4 },
  offtake_floor: { safety: 12, yield: 6 },
  esg_mitigation: { esg: 12 },
  long_tenor: { safety: 10 },
  operating_control: { control: 14 }
};

export function evaluateNegotiation(
  partner: PartnerDefinition,
  relationship: number,
  topic: string,
  offers: string[],
  concession?: string
): NegotiationPreview {
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

    if (!effect) {
      return;
    }

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
