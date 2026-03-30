import { formatPhase } from "../../shared/lib/formatters";
import type { GameState } from "../models/types";

export const selectHudMetrics = (game: GameState) => ({
  turn: game.turn,
  year: game.marketState.year,
  phaseLabel: formatPhase(game.currentPhase),
  cash: game.player.cash,
  investmentCapacity: game.player.investmentCapacity,
  hqReputation: game.player.hqReputation,
  esgScore: game.player.esgScore
});

export const selectContextRailData = (game: GameState) => ({
  fragmentCount: game.fragments.length,
  leadCount: game.leads.length,
  dealCount: game.deals.length,
  alertCount: game.incidents.filter((incident) => !incident.resolved).length,
  latestMessage: game.messageLog.at(-1)?.body ?? "案件の種を集めて、次の一手を決めてください。"
});
