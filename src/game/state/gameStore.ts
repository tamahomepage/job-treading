import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { clamp } from "../../shared/lib/formatters";
import { computeApprovalCase } from "../engine/systems/approvalScoring";
import { recomputeDealState } from "../engine/systems/dealScoring";
import { evaluateNegotiation } from "../engine/systems/negotiationScoring";
import { masterData } from "../content/loaders";
import { createInitialGameState } from "./createInitialGameState";
import type {
  DealSlotId,
  DealState,
  EventCategory,
  GameState,
  IncidentResponseOption,
  LeadCandidateView
} from "../models/types";
import { phaseOrder } from "../models/types";

interface GameStore {
  masterData: typeof masterData;
  game: GameState;
  startNewGame: () => void;
  advancePhase: () => void;
  advanceYear: () => void;
  runIntelligenceSweep: () => void;
  togglePinFragment: (fragmentId: string) => void;
  createLeadFromCandidate: (candidate: LeadCandidateView) => string;
  createDealFromLead: (leadId: string, templateId: string) => string | undefined;
  assignFragmentToSlot: (
    dealId: string,
    slotId: DealSlotId,
    fragmentId: string
  ) => void;
  assignPartnerToSlot: (
    dealId: string,
    slotId: DealSlotId,
    partnerId: string
  ) => void;
  openNegotiation: (
    dealId: string,
    partnerId: string,
    requestedSlot: DealSlotId
  ) => string;
  submitNegotiationOffer: (payload: {
    sessionId: string;
    topic: string;
    offers: string[];
    concession?: string;
  }) => void;
  submitApprovalForDeal: (dealId: string) => void;
  chooseYearlyFocus: (focus: "network" | "capital_efficiency" | "esg_recovery") => void;
  triggerDemoIncident: () => string | undefined;
  resolveIncident: (incidentId: string, responseId: string) => void;
}

const refreshDeal = (game: GameState, deal: DealState): DealState =>
  recomputeDealState(deal, game, masterData);

const addLogMessage = (
  game: GameState,
  title: string,
  body: string,
  level: "info" | "warning" | "critical" = "info"
) => {
  game.messageLog.push({
    id: `msg_${game.turn}_${game.messageLog.length + 1}`,
    turn: game.turn,
    phase: game.currentPhase,
    level,
    title,
    body
  });
};

const nextPhase = (current: GameState["currentPhase"]) => {
  const index = phaseOrder.indexOf(current);
  return phaseOrder[(index + 1) % phaseOrder.length];
};

const cloneGame = (game: GameState): GameState => structuredClone(game);

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      masterData,
      game: createInitialGameState(masterData),
      startNewGame: () => {
        set({ game: createInitialGameState(masterData) });
      },
      advancePhase: () => {
        set((state) => {
          const game = cloneGame(state.game);
          const next = nextPhase(game.currentPhase);

          if (game.currentPhase === "year_end") {
            const advanced = createInitialGameState(masterData);
            advanced.turn = game.turn + 1;
            advanced.marketState.year = game.marketState.year + 1;
            return { game: advanced };
          }

          game.currentPhase = next;
          addLogMessage(game, "フェーズ移行", `${next} フェーズに進みました。`);
          return { game };
        });
      },
      advanceYear: () => {
        set((state) => {
          const game = cloneGame(state.game);
          game.turn += 1;
          game.marketState.year += 1;
          game.currentPhase = "market_update";
          game.player.actionsRemaining = game.player.yearlyActionBudget;
          game.player.approvalsRemaining = game.player.yearlyApprovalSlots;
          game.player.emergencyActionsRemaining = 1;
          game.fragments.forEach((fragment) => {
            fragment.expiresIn -= 1;
          });
          game.fragments = game.fragments.filter((fragment) => fragment.expiresIn > 0);
          addLogMessage(
            game,
            `年度更新 ${game.marketState.year}`,
            "年度をまたぎ、行動回数と承認枠がリフレッシュされました。"
          );
          return { game };
        });
      },
      runIntelligenceSweep: () => {
        set((state) => {
          const game = cloneGame(state.game);

          if (game.player.actionsRemaining <= 0) {
            addLogMessage(game, "行動不足", "今期のアクションが足りません。", "warning");
            return { game };
          }

          const baseIndex = game.fragments.length;
          const newFragments = masterData.fragmentTemplates
            .slice(baseIndex % masterData.fragmentTemplates.length, (baseIndex % masterData.fragmentTemplates.length) + 3)
            .map((template, index) => ({
              id: `frag_inst_${game.turn}_${baseIndex + index + 1}`,
              templateId: template.id,
              title: template.title,
              region: template.regionPool[index % template.regionPool.length],
              industry: template.industryPool[index % template.industryPool.length],
              sourceType: template.sourceType,
              tags: template.tags,
              certainty:
                template.certaintyRange[0] +
                (index % (template.certaintyRange[1] - template.certaintyRange[0] + 1)),
              expiresIn: template.expiryRange[1],
              leadValue: template.leadValue,
              pinned: false,
              discoveredTurn: game.turn
            }));

          game.fragments.push(...newFragments);
          game.player.actionsRemaining -= 1;
          game.currentPhase = "lead_discovery";
          addLogMessage(
            game,
            "情報収集完了",
            `${newFragments.length}件の新規断片情報を獲得しました。`
          );
          return { game };
        });
      },
      togglePinFragment: (fragmentId) => {
        set((state) => {
          const game = cloneGame(state.game);
          const fragment = game.fragments.find((entry) => entry.id === fragmentId);

          if (fragment) {
            fragment.pinned = !fragment.pinned;
          }

          return { game };
        });
      },
      createLeadFromCandidate: (candidate) => {
        const leadId = `lead_${Date.now()}`;

        set((state) => {
          const game = cloneGame(state.game);
          game.leads.push({
            id: leadId,
            name: candidate.name,
            region: candidate.region,
            industry: candidate.industry,
            fragmentIds: candidate.fragmentIds,
            candidateTemplateIds: candidate.candidateTemplateIds,
            selectedTemplateId: candidate.candidateTemplateIds[0],
            score: candidate.score,
            missingNeeds: candidate.missingNeeds,
            status: "open"
          });
          game.currentPhase = "deal_structuring";
          addLogMessage(game, "案件リード化", `${candidate.name} を案件リードとして登録しました。`);
          return { game };
        });

        return leadId;
      },
      createDealFromLead: (leadId, templateId) => {
        const dealId = `deal_${Date.now()}`;
        const lead = get().game.leads.find((entry) => entry.id === leadId);
        const template = masterData.dealTemplates.find((entry) => entry.id === templateId);

        if (!lead || !template) {
          return undefined;
        }

        set((state) => {
          const game = cloneGame(state.game);
          const rawDeal: DealState = {
            id: dealId,
            name: lead.name,
            templateId,
            region: lead.region,
            industry: lead.industry,
            stage: "structuring",
            sourceLeadId: leadId,
            slotAssignments: {},
            contractTerms: {
              equitySharePlayer: 35,
              controlLevel: 2,
              localContentRatio: 30,
              offtakeYears: 10,
              priceAdjustmentClause: true,
              esgMitigationBudget: 6,
              exitOption: true,
              guarantees: ["parent_support"]
            },
            capex: template.baseCapex,
            equityRequired: template.baseCapex * template.baseEquityRatio,
            debtRatio: 1 - template.baseEquityRatio,
            expectedIrr: template.baseIrr * 100,
            approvalDifficulty: 72,
            structureScore: 0,
            riskExposure: template.riskWeights,
            synergyTags: template.synergyTags,
            timeline: {
              createdTurn: game.turn,
              targetOperateIn: template.timeToOperate
            },
            history: [
              {
                turn: game.turn,
                type: "create",
                message: "リードから案件化された"
              }
            ]
          };

          const recomputed = refreshDeal(game, rawDeal);
          game.deals.push(recomputed);
          game.currentPhase = "deal_structuring";
          addLogMessage(game, "案件組成開始", `${lead.name} の案件キャンバスを開きました。`);
          return { game };
        });

        return dealId;
      },
      assignFragmentToSlot: (dealId, slotId, fragmentId) => {
        set((state) => {
          const game = cloneGame(state.game);
          const deal = game.deals.find((entry) => entry.id === dealId);
          const fragment = game.fragments.find((entry) => entry.id === fragmentId);

          if (!deal || !fragment) {
            return { game };
          }

          deal.slotAssignments[slotId] = {
            kind: "fragment",
            refId: fragmentId,
            quality: fragment.certainty * 20
          };

          Object.assign(deal, refreshDeal(game, deal));
          return { game };
        });
      },
      assignPartnerToSlot: (dealId, slotId, partnerId) => {
        set((state) => {
          const game = cloneGame(state.game);
          const deal = game.deals.find((entry) => entry.id === dealId);
          const relation = game.player.partnerRelations[partnerId] ?? 0;

          if (!deal) {
            return { game };
          }

          deal.slotAssignments[slotId] = {
            kind: "partner",
            refId: partnerId,
            quality: 48 + relation * 12
          };

          Object.assign(deal, refreshDeal(game, deal));
          return { game };
        });
      },
      openNegotiation: (dealId, partnerId, requestedSlot) => {
        const sessionId = `nego_${Date.now()}`;

        set((state) => {
          const game = cloneGame(state.game);
          game.negotiations.push({
            id: sessionId,
            dealId,
            partnerId,
            requestedSlot,
            round: 1,
            maxRounds: 3,
            topic: "pricing",
            proposedTerms: [],
            concessions: [],
            acceptancePreview: 0,
            status: "open",
            revealedPreferences: [],
            log: []
          });
          game.currentPhase = "negotiation";
          addLogMessage(game, "交渉開始", `${requestedSlot} スロットについて交渉を開始しました。`);
          return { game };
        });

        return sessionId;
      },
      submitNegotiationOffer: ({ sessionId, topic, offers, concession }) => {
        set((state) => {
          const game = cloneGame(state.game);
          const session = game.negotiations.find((entry) => entry.id === sessionId);

          if (!session) {
            return { game };
          }

          const partner = masterData.partners.find((entry) => entry.id === session.partnerId);
          const deal = game.deals.find((entry) => entry.id === session.dealId);

          if (!partner || !deal) {
            return { game };
          }

          const relationship = game.player.partnerRelations[partner.id] ?? partner.relationshipBase;
          const preview = evaluateNegotiation(
            partner,
            relationship,
            topic,
            offers,
            concession
          );

          session.topic = topic;
          session.proposedTerms = offers;
          session.concessions = concession ? [concession] : [];
          session.acceptancePreview = preview.acceptance;
          session.log.push({
            round: session.round,
            speaker: "partner",
            text: preview.notes.join(" / "),
            deltaRelationship: preview.relationshipDelta
          });

          game.player.partnerRelations[partner.id] = clamp(
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
            Object.assign(deal, refreshDeal(game, deal));
            addLogMessage(
              game,
              "交渉妥結",
              `${partner.name} と ${session.requestedSlot} の条件で合意しました。`
            );
          } else {
            session.round += 1;
            session.status = session.round > session.maxRounds ? "stalled" : "open";
            addLogMessage(
              game,
              "交渉継続",
              `${partner.name} との条件調整が続いています。`,
              "warning"
            );
          }

          return { game };
        });
      },
      submitApprovalForDeal: (dealId) => {
        set((state) => {
          const game = cloneGame(state.game);
          const deal = game.deals.find((entry) => entry.id === dealId);

          if (!deal || game.player.approvalsRemaining <= 0) {
            return { game };
          }

          const approval = computeApprovalCase(deal, game, masterData);
          game.approvals = game.approvals.filter((entry) => entry.dealId !== dealId);
          game.approvals.push(approval);
          game.player.approvalsRemaining -= 1;
          game.currentPhase = "approval";

          if (approval.status === "approved") {
            deal.stage = "approved";
            game.player.hqReputation += 1;
            addLogMessage(game, "稟議承認", `${deal.name} が正式承認されました。`);
          } else if (approval.status === "conditional") {
            deal.stage = "approval_pending";
            addLogMessage(
              game,
              "条件付き承認",
              `${deal.name} は条件付きで継続審査となりました。`,
              "warning"
            );
          } else {
            deal.stage = "structuring";
            game.player.hqReputation -= 1;
            addLogMessage(
              game,
              "稟議差し戻し",
              `${deal.name} は社内論点の解消が必要です。`,
              "critical"
            );
          }

          return { game };
        });
      },
      chooseYearlyFocus: (focus) => {
        set((state) => {
          const game = cloneGame(state.game);
          game.player.yearlyFocus = focus;
          addLogMessage(game, "来期方針設定", `${focus} を来期の重点方針に設定しました。`);
          return { game };
        });
      },
      triggerDemoIncident: () => {
        const incidentId = `incident_${Date.now()}`;

        set((state) => {
          const game = cloneGame(state.game);
          const template = masterData.eventTemplates[game.turn % masterData.eventTemplates.length];
          const dealIds = game.deals.slice(0, 2).map((deal) => deal.id);
          const responseOptions: IncidentResponseOption[] = template.responseOptions.map(
            (label, index) => ({
              id: `resp_${index + 1}`,
              label,
              cashImpact: (index + 1) * 4,
              delayImpact: index === 0 ? 0 : 1,
              trustImpact: index === 0 ? -1 : 1,
              esgImpact: index === 1 ? 2 : 0,
              unlocks: index === 1 ? ["local_processing_unlock"] : []
            })
          );

          game.incidents.push({
            id: incidentId,
            templateId: template.id,
            turn: game.turn,
            category: template.category as EventCategory,
            severity: template.severityBase,
            targetDealIds: dealIds,
            targetRegionIds: template.targetRules.regionIds ?? [],
            responseOptions,
            resolved: false
          });
          game.currentPhase = "risk_response";
          addLogMessage(game, "リスク発生", template.name, "critical");
          return { game };
        });

        return incidentId;
      },
      resolveIncident: (incidentId, responseId) => {
        set((state) => {
          const game = cloneGame(state.game);
          const incident = game.incidents.find((entry) => entry.id === incidentId);

          if (!incident) {
            return { game };
          }

          const response = incident.responseOptions.find((entry) => entry.id === responseId);

          if (!response) {
            return { game };
          }

          game.player.cash -= response.cashImpact;
          game.player.esgScore += response.esgImpact;
          incident.resolved = true;
          addLogMessage(
            game,
            "危機対応完了",
            `${response.label} を実行しました。`,
            "warning"
          );
          return { game };
        });
      }
    }),
    {
      name: "sogo-shosha-sim-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ game: state.game })
    }
  )
);
