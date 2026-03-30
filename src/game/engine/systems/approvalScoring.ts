import { clamp } from "../../../shared/lib/formatters";
import type {
  ApprovalCase,
  ApprovalDepartmentId,
  DealState,
  GameState,
  MasterData
} from "../../models/types";

export function computeApprovalCase(
  deal: DealState,
  game: GameState,
  data: MasterData
): ApprovalCase {
  const departmentScores = {} as Record<ApprovalDepartmentId, number>;
  const vetoMessages: string[] = [];
  const recommendedActions: string[] = [];

  data.approvalRules.forEach((rule) => {
    const cashBufferAfterInvestment = game.player.cash - deal.equityRequired;
    const paybackYears = Math.max(2, 10 - deal.expectedIrr / 2);
    const metrics: Record<string, number> = {
      expectedIrr: deal.expectedIrr,
      paybackYears,
      equityRequired: deal.equityRequired,
      cashBufferAfterInvestment,
      structureScore: deal.structureScore,
      esgScore: game.player.esgScore,
      riskExposure: Object.values(deal.riskExposure).reduce(
        (sum, value) => sum + (value ?? 0),
        0
      )
    };

    const score = Object.entries(rule.weights).reduce((sum, [key, weight]) => {
      return sum + (metrics[key] ?? 0) * weight;
    }, 50);

    departmentScores[rule.id] = clamp(score, 0, 100);

    rule.vetoRules.forEach((veto) => {
      const value = metrics[veto.key] ?? 0;
      const triggered =
        (veto.op === "lt" && value < veto.value) ||
        (veto.op === "lte" && value <= veto.value) ||
        (veto.op === "gt" && value > veto.value) ||
        (veto.op === "gte" && value >= veto.value) ||
        (veto.op === "eq" && value === veto.value);

      if (triggered) {
        vetoMessages.push(`${rule.displayName}: ${veto.message}`);
      }
    });
  });

  if (departmentScores.esg < 60) {
    recommendedActions.push("ESG対策予算を積み増す");
  }
  if (departmentScores.risk < 60) {
    recommendedActions.push("代替物流・ヘッジ条件を追加する");
  }
  if (departmentScores.finance < 60) {
    recommendedActions.push("自己資本比率か回収構造を見直す");
  }

  const averageScore =
    Object.values(departmentScores).reduce((sum, value) => sum + value, 0) /
    Object.values(departmentScores).length;

  const status =
    vetoMessages.length > 0
      ? "rejected"
      : averageScore >= 72
        ? "approved"
        : averageScore >= 58
          ? "conditional"
          : "rejected";

  return {
    id: `approval_${deal.id}`,
    dealId: deal.id,
    submittedTurn: game.turn,
    departmentScores,
    vetoMessages,
    recommendedActions,
    status
  };
}
