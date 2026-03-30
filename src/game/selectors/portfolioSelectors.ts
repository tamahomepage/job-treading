import { clamp } from "../../shared/lib/formatters";
import type { GameState, PortfolioComputedView } from "../models/types";

export function selectPortfolioView(game: GameState): PortfolioComputedView {
  const activeDeals = game.deals.filter(
    (deal) => deal.stage !== "terminated" && deal.stage !== "divested"
  );
  const cashFlowProjection = activeDeals.reduce((sum, deal) => {
    return sum + (deal.operatingMetrics?.ebitda ?? deal.expectedIrr);
  }, 0);

  const concentrationRiskScore = clamp(
    activeDeals.filter((deal) => deal.region === "SEA").length * 12 +
      activeDeals.filter((deal) => deal.industry === "energy").length * 10,
    0,
    100
  );

  const synergyEdges = activeDeals.flatMap((deal) => {
    return activeDeals
      .filter((other) => other.id !== deal.id)
      .filter((other) =>
        deal.synergyTags.some((tag) => other.synergyTags.includes(tag))
      )
      .map((other) => ({
        fromDealId: deal.id,
        toDealId: other.id,
        type: deal.region === other.region ? "regional" : "vertical",
        value: 12
      }));
  });

  const corporateValueScore = clamp(
    game.player.cash +
      cashFlowProjection * 2 +
      synergyEdges.length * 8 +
      game.player.hqReputation * 6 -
      concentrationRiskScore,
    0,
    999
  );

  return {
    corporateValueScore,
    cashFlowProjection,
    concentrationRiskScore,
    synergyEdges
  };
}
