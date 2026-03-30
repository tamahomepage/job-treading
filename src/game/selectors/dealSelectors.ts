import { deriveLeadCandidates } from "../engine/systems/leadGeneration";
import {
  computeDealView,
  getLeadFragments,
  getSlotSuggestions
} from "../engine/systems/dealScoring";
import type { DealSlotId, GameState, MasterData } from "../models/types";

export const selectLeadCandidates = (game: GameState, data: MasterData) => {
  const pinned = game.fragments.filter((fragment) => fragment.pinned);
  return deriveLeadCandidates(pinned.length > 0 ? pinned : game.fragments, data);
};

export const selectDealCanvasView = (
  game: GameState,
  data: MasterData,
  dealId: string
) => {
  const deal = game.deals.find((entry) => entry.id === dealId);

  if (!deal) {
    return undefined;
  }

  const view = computeDealView(deal, game, data);

  return {
    deal,
    view,
    leadFragments: getLeadFragments(game, deal),
    slotSuggestions: Object.fromEntries(
      (
        [
          "demand",
          "technology",
          "localPartner",
          "finance",
          "permit",
          "logistics",
          "offtake",
          "operator"
        ] as DealSlotId[]
      ).map((slotId) => [slotId, getSlotSuggestions(game, deal, data, slotId)])
    ) as Record<DealSlotId, ReturnType<typeof getSlotSuggestions>>
  };
};
