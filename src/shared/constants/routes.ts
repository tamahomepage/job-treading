export const routes = {
  top: "/",
  newGame: "/new-game",
  map: "/play/map",
  intelligence: "/play/intelligence",
  inbox: "/play/inbox",
  deal: (dealId: string) => `/play/deal/${dealId}`,
  negotiation: (sessionId: string) => `/play/negotiation/${sessionId}`,
  approval: (dealId: string) => `/play/approval/${dealId}`,
  portfolio: "/play/portfolio",
  risk: (incidentId: string) => `/play/risk/${incidentId}`,
  yearEnd: "/play/year-end"
} as const;
