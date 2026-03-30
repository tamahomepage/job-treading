import {
  advanceYear,
  assignFragmentToSlot,
  assignPartnerToSlot,
  chooseYearlyFocus,
  computeApproval,
  computeDealView,
  computePortfolio,
  createDealFromCandidate,
  deriveLeadCandidates,
  getLeadFragments,
  getSelectedApproval,
  getSelectedDeal,
  getSelectedIncident,
  getSelectedNegotiation,
  getSlotSuggestions,
  loadState,
  openNegotiation,
  partners,
  regionName,
  resetState,
  resolveRiskIncident,
  runIntelligenceSweep,
  saveState,
  setScreen,
  submitApproval,
  submitNegotiationOffer,
  togglePinFragment,
  triggerRiskIncident
} from "./game.js";

const app = document.getElementById("app");
let state = loadState();

function metric(label, value, note = "", tone = "") {
  return `
    <article class="metric-card ${tone}">
      <span class="metric-label">${label}</span>
      <strong class="metric-value">${value}</strong>
      ${note ? `<span class="metric-note">${note}</span>` : ""}
    </article>
  `;
}

function panel(title, subtitle, body, extraClass = "") {
  return `
    <section class="panel ${extraClass}">
      <header class="panel-header">
        <div>
          <h2 class="panel-title">${title}</h2>
          ${subtitle ? `<p class="panel-subtitle">${subtitle}</p>` : ""}
        </div>
      </header>
      ${body}
    </section>
  `;
}

function button(action, label, variant = "ghost", attrs = "") {
  return `<button class="btn btn-${variant}" data-action="${action}" ${attrs}>${label}</button>`;
}

function renderTop() {
  return `
    <section class="hero">
      <div class="hero-copy">
        <span class="eyebrow">Global Value Architect</span>
        <h1>世界の断片をつなぎ、新しい収益構造を設計する</h1>
        <p>
          総合商社らしい面白さを、案件発見ではなく「案件組成」で体験するプロトタイプです。
          情報収集、案件化、交渉、稟議、危機対応、ポートフォリオ設計まで一気に遊べます。
        </p>
        <div class="button-row">
          ${button("new-game", "新規ゲーム開始", "primary")}
          ${button("goto", "続きから開く", "secondary", 'data-screen="map"')}
        </div>
      </div>
      <div class="hero-rail">
        <div class="info-tile">1. 情勢を読む</div>
        <div class="info-tile">2. 断片を集める</div>
        <div class="info-tile">3. 案件を組み立てる</div>
        <div class="info-tile">4. 交渉・稟議で通す</div>
        <div class="info-tile">5. ポートフォリオで勝つ</div>
      </div>
    </section>
  `;
}

function renderMap() {
  const regionCards = Object.entries(state.market.regions)
    .map(
      ([regionId, metrics]) => `
        <article class="region-card">
          <div class="split">
            <div>
              <h3>${regionName(regionId)}</h3>
              <p class="muted">需要と危険の温度感</p>
            </div>
            <span class="pill">${regionId}</span>
          </div>
          <div class="metric-grid">
            ${metric("Opportunity", metrics.opportunityScore, "", "good")}
            ${metric("Risk", metrics.riskScore, "", "warn")}
          </div>
          <div class="tag-row">
            <span class="pill">Permit ${metrics.permitTightness}</span>
            <span class="pill">Sentiment ${metrics.publicSentiment}</span>
          </div>
        </article>
      `
    )
    .join("");

  return `
    <div class="page-head">
      <div>
        <h1>World Map</h1>
        <p>今年どこが熱いかを読み、どの地域・産業に人を張るか決めます。</p>
      </div>
      <div class="button-row">
        ${button("goto", "情報収集へ", "primary", 'data-screen="intelligence"')}
      </div>
    </div>
    <section class="region-grid">${regionCards}</section>
    ${panel(
      "マクロシグナル",
      "市況と政策",
      `
        <div class="tag-row">
          ${state.market.policySignals.map((signal) => `<span class="pill">${signal}</span>`).join("")}
        </div>
        <div class="tag-row">
          <span class="pill">LNG ${state.market.commodityPrices.lng}</span>
          <span class="pill">Wheat ${state.market.commodityPrices.wheat}</span>
          <span class="pill">USDJPY ${state.market.fxRates.USDJPY}</span>
        </div>
      `
    )}
  `;
}

function renderIntelligence() {
  const staffItems = Object.entries(state.player.staff)
    .map(
      ([role, pool]) => `
        <article class="list-item">
          <div class="split">
            <strong>${role}</strong>
            <span class="pill">${pool.assigned}/${pool.total} assigned</span>
          </div>
          <span class="muted">fatigue ${pool.fatigue}</span>
        </article>
      `
    )
    .join("");

  const fragmentItems = state.fragments
    .slice(-5)
    .map(
      (fragment) => `
        <article class="list-item">
          <strong>${fragment.title}</strong>
          <span class="muted">${fragment.tags.join(", ")}</span>
        </article>
      `
    )
    .join("");

  return `
    <div class="page-head">
      <div>
        <h1>Intelligence</h1>
        <p>人材を張って、案件化の元になる断片情報を増やします。</p>
      </div>
      <div class="button-row">
        ${button("collect-intelligence", "情報収集を実行", "primary")}
        ${button("goto", "Inboxを見る", "secondary", 'data-screen="inbox"')}
      </div>
    </div>
    <div class="two-col">
      ${panel("情報収集ボード", "まずは断片情報を増やす", `<div class="list">${staffItems}</div>`)}
      ${panel("最新の断片情報", "情報収集後に案件化へ回す", `<div class="list">${fragmentItems}</div>`)}
    </div>
  `;
}

function renderInbox() {
  const candidates = deriveLeadCandidates(state);
  const fragments = state.fragments
    .map(
      (fragment) => `
        <article class="list-item">
          <div class="split">
            <strong>${fragment.title}</strong>
            ${button("toggle-pin", fragment.pinned ? "Pinned" : "Pin", fragment.pinned ? "secondary" : "ghost", `data-fragment-id="${fragment.id}"`)}
          </div>
          <div class="tag-row">
            ${fragment.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
          </div>
          <span class="muted">certainty ${fragment.certainty} / expires ${fragment.expiresIn}</span>
        </article>
      `
    )
    .join("");

  const candidateItems =
    candidates.length > 0
      ? candidates
          .map(
            (candidate) => `
              <article class="list-item">
                <div class="split">
                  <strong>${candidate.name}</strong>
                  <span class="score ${candidate.score >= 70 ? "good" : "warn"}">score ${candidate.score}</span>
                </div>
                <span class="muted">missing: ${candidate.missingNeeds.join(", ") || "none"}</span>
                <div class="button-row">
                  ${button("create-deal", "この候補で案件化", "primary", `data-candidate-id="${candidate.id}"`)}
                </div>
                <div class="stack tight">
                  ${candidate.rationale.map((line) => `<span class="muted">${line}</span>`).join("")}
                </div>
              </article>
            `
          )
          .join("")
      : `<div class="empty-state">ピン留めした断片情報が不足しています。Need / Finance / Access 系を揃えるとリード化しやすくなります。</div>`;

  return `
    <div class="page-head">
      <div>
        <h1>Deal Inbox</h1>
        <p>断片情報を束ねて、案件仮説をリード化します。</p>
      </div>
    </div>
    <div class="two-col">
      ${panel("断片情報", "ピン留めして案件仮説に寄せる", `<div class="list">${fragments}</div>`)}
      ${panel("案件候補", "ピン留め中の断片から自動検出", `<div class="list">${candidateItems}</div>`)}
    </div>
  `;
}

function renderDeal() {
  const deal = getSelectedDeal(state);
  if (!deal) {
    return `<div class="empty-state">まだ案件がありません。Inbox から案件化してください。</div>`;
  }

  const view = computeDealView(state, deal);
  const leadFragments = getLeadFragments(state, deal);
  const orderedSlots = [
    "demand",
    "technology",
    "localPartner",
    "finance",
    "permit",
    "logistics",
    "offtake",
    "operator"
  ];

  const slotCards = orderedSlots
    .map((slotId) => {
      const current = deal.slotAssignments[slotId];
      const suggestions = getSlotSuggestions(state, deal, slotId);
      return `
        <article class="slot-card">
          <div class="split">
            <div>
              <h3>${slotId}</h3>
              <p class="muted">${current ? `${current.kind}: ${current.refId}` : "未設定"}</p>
            </div>
            ${current ? `<span class="pill">${Math.round(current.quality)}</span>` : ""}
          </div>
          ${suggestions.fragments.length ? `
            <div class="stack tight">
              <span class="muted">Fragment</span>
              ${suggestions.fragments.slice(0, 2).map((fragment) => `
                <div class="mini-row">
                  <span>${fragment.title}</span>
                  ${button("assign-fragment", "反映", "ghost", `data-deal-id="${deal.id}" data-slot-id="${slotId}" data-fragment-id="${fragment.id}"`)}
                </div>
              `).join("")}
            </div>
          ` : ""}
          ${suggestions.partners.length ? `
            <div class="stack tight">
              <span class="muted">Partner</span>
              ${suggestions.partners.slice(0, 2).map((partner) => `
                <div class="mini-row partner-row">
                  <span>${partner.name}</span>
                  <div class="button-row tight">
                    ${button("assign-partner", "直割当", "ghost", `data-deal-id="${deal.id}" data-slot-id="${slotId}" data-partner-id="${partner.id}"`)}
                    ${button("open-negotiation", "交渉", "secondary", `data-deal-id="${deal.id}" data-slot-id="${slotId}" data-partner-id="${partner.id}"`)}
                  </div>
                </div>
              `).join("")}
            </div>
          ` : ""}
        </article>
      `;
    })
    .join("");

  return `
    <div class="page-head">
      <div>
        <h1>Deal Canvas</h1>
        <p>不足スロットを埋め、案件の成立スコアを上げていきます。</p>
      </div>
      <div class="button-row">
        ${button("goto", "Inboxへ戻る", "ghost", 'data-screen="inbox"')}
        ${button("submit-approval", "稟議へ進む", "primary", `data-deal-id="${deal.id}"`)}
      </div>
    </div>
    <section class="metric-grid top-metrics">
      ${metric("Structure Score", Math.round(view.structureScore), "", view.structureScore >= 70 ? "good" : "warn")}
      ${metric("Approval Preview", Math.round(view.approvalPreview), "", view.approvalPreview >= 70 ? "good" : "warn")}
      ${metric("IRR", `${deal.expectedIrr.toFixed(1)}%`)}
      ${metric("Equity", Math.round(deal.equityRequired))}
    </section>
    <div class="two-col">
      ${panel(
        deal.name,
        "案件の中核条件",
        `
          <div class="stack">
            <span class="muted">unresolved risks: ${view.unresolvedRisks.length ? view.unresolvedRisks.join(" / ") : "none"}</span>
            <span class="muted">synergy: ${view.synergyPreview.length ? view.synergyPreview.join(" / ") : "まだなし"}</span>
            <div class="list">
              ${leadFragments.map((fragment) => `
                <article class="list-item">
                  <strong>${fragment.title}</strong>
                  <span class="muted">${fragment.tags.join(", ")}</span>
                </article>
              `).join("")}
            </div>
          </div>
        `
      )}
      ${panel(
        "契約方針",
        "MVPでは固定値で開始",
        `
          <div class="list">
            <article class="list-item"><strong>Player Equity Share</strong><span class="muted">${deal.contractTerms.equitySharePlayer}%</span></article>
            <article class="list-item"><strong>Control Level</strong><span class="muted">${deal.contractTerms.controlLevel}</span></article>
            <article class="list-item"><strong>ESG Budget</strong><span class="muted">${deal.contractTerms.esgMitigationBudget}</span></article>
          </div>
        `
      )}
    </div>
    <section class="slot-grid">${slotCards}</section>
  `;
}

function renderNegotiation() {
  const session = getSelectedNegotiation(state);
  if (!session) return `<div class="empty-state">交渉セッションがありません。</div>`;
  const partner = partners.find((entry) => entry.id === session.partnerId);
  if (!partner) return `<div class="empty-state">交渉相手が見つかりません。</div>`;

  const log = session.log.length
    ? session.log
        .map(
          (entry) => `
            <article class="list-item">
              <strong>Round ${entry.round}</strong>
              <span class="muted">${entry.text}</span>
            </article>
          `
        )
        .join("")
    : `<div class="empty-state">まだオファーを送っていません。</div>`;

  const topicButtons = ["pricing", "guarantee", "local_content", "operating_control"]
    .map(
      (topic) => `
        <label class="choice-chip">
          <input type="radio" name="topic" value="${topic}" ${topic === session.topic ? "checked" : ""} />
          <span>${topic}</span>
        </label>
      `
    )
    .join("");

  const offerButtons = ["pricing", "guarantee", "local_content", "offtake_floor", "esg_mitigation", "long_tenor"]
    .map(
      (offer) => `
        <label class="choice-chip">
          <input type="checkbox" name="offer" value="${offer}" ${session.proposedTerms.includes(offer) ? "checked" : ""} />
          <span>${offer}</span>
        </label>
      `
    )
    .join("");

  const concessionButtons = ["board_seat", "local_content", "esg_mitigation"]
    .map(
      (concession) => `
        <label class="choice-chip">
          <input type="radio" name="concession" value="${concession}" ${session.concessions.includes(concession) ? "checked" : ""} />
          <span>${concession}</span>
        </label>
      `
    )
    .join("");

  return `
    <div class="page-head">
      <div>
        <h1>Negotiation</h1>
        <p>相手の重視軸を読み、譲歩と提案の組み合わせで合意を狙います。</p>
      </div>
      <div class="button-row">
        ${button("goto", "Dealへ戻る", "ghost", 'data-screen="deal"')}
      </div>
    </div>
    <section class="metric-grid top-metrics">
      ${metric("Round", `${session.round}/${session.maxRounds}`)}
      ${metric("Acceptance", Math.round(session.acceptancePreview || 0), "", (session.acceptancePreview || 0) >= 70 ? "good" : "warn")}
    </section>
    <div class="two-col">
      ${panel(
        partner.name,
        `requested slot: ${session.requestedSlot}`,
        `
          <div class="stack">
            <span class="muted">type: ${partner.type}</span>
            <span class="muted">preference: ${Object.keys(partner.preferenceWeights).join(", ")}</span>
            <span class="muted">red lines: ${partner.redLines.join(", ") || "none"}</span>
          </div>
        `
      )}
      ${panel("交渉ログ", "相手の反応を読む", `<div class="list">${log}</div>`)}
    </div>
    ${panel(
      "Offer Builder",
      "議題1つ、提案2つ、譲歩1つの形で作る",
      `
        <form id="negotiation-form" class="stack">
          <div class="stack tight">
            <span class="muted">議題</span>
            <div class="choice-row">${topicButtons}</div>
          </div>
          <div class="stack tight">
            <span class="muted">提案</span>
            <div class="choice-row">${offerButtons}</div>
          </div>
          <div class="stack tight">
            <span class="muted">譲歩</span>
            <div class="choice-row">
              <label class="choice-chip">
                <input type="radio" name="concession" value="" ${session.concessions.length === 0 ? "checked" : ""} />
                <span>none</span>
              </label>
              ${concessionButtons}
            </div>
          </div>
          ${button("submit-negotiation", "オファー送信", "primary", `data-session-id="${session.id}"`)}
        </form>
      `
    )}
  `;
}

function renderApproval() {
  const deal = getSelectedDeal(state);
  if (!deal) return `<div class="empty-state">案件がありません。</div>`;
  const approval = getSelectedApproval(state);
  const computed = approval ?? computeApproval(state, deal);

  const scores = Object.entries(computed.departmentScores)
    .map(
      ([department, score]) => `
        <article class="list-item">
          <div class="split">
            <strong>${department}</strong>
            <span class="${score >= 70 ? "good" : score >= 55 ? "warn" : "danger"}">${Math.round(score)}</span>
          </div>
        </article>
      `
    )
    .join("");

  return `
    <div class="page-head">
      <div>
        <h1>Approval</h1>
        <p>外では通った案件を、本社の財務・リスク・ESG視点でも通します。</p>
      </div>
      <div class="button-row">
        ${button("goto", "Dealへ戻る", "ghost", 'data-screen="deal"')}
      </div>
    </div>
    <div class="two-col">
      ${panel("部門別評価", "財務・リスク・ESGの温度感", `<div class="list">${scores}</div>`)}
      ${panel(
        deal.name,
        `stage: ${deal.stage}`,
        `
          <div class="stack">
            <span class="muted">structure score ${Math.round(deal.structureScore)}</span>
            <span class="muted">expected IRR ${deal.expectedIrr.toFixed(1)}%</span>
            <span class="muted">approval difficulty ${Math.round(deal.approvalDifficulty)}</span>
            ${computed.vetoMessages.length ? `<div class="list">${computed.vetoMessages.map((message) => `<article class="list-item"><span class="danger">${message}</span></article>`).join("")}</div>` : ""}
            ${computed.recommendedActions.length ? `<div class="list">${computed.recommendedActions.map((action) => `<article class="list-item"><span class="muted">${action}</span></article>`).join("")}</div>` : ""}
            ${approval
              ? button("goto", "ポートフォリオへ", "secondary", 'data-screen="portfolio"')
              : button("confirm-approval", "稟議を提出", "primary", `data-deal-id="${deal.id}"`)}
          </div>
        `
      )}
    </div>
  `;
}

function renderPortfolio() {
  const portfolio = computePortfolio(state);
  return `
    <div class="page-head">
      <div>
        <h1>Portfolio</h1>
        <p>単独案件ではなく、地域分散とシナジーの構造価値で見る画面です。</p>
      </div>
      <div class="button-row">
        ${button("goto", "決算へ", "secondary", 'data-screen="year-end"')}
        ${button("trigger-risk", "リスク発生", "danger")}
      </div>
    </div>
    <section class="metric-grid top-metrics">
      ${metric("Corporate Value", Math.round(portfolio.corporateValueScore))}
      ${metric("CF Projection", Math.round(portfolio.cashFlowProjection))}
      ${metric("Concentration Risk", Math.round(portfolio.concentrationRiskScore), "", portfolio.concentrationRiskScore >= 60 ? "danger" : "warn")}
    </section>
    <div class="two-col">
      ${panel(
        "保有案件",
        "現在のポートフォリオ",
        portfolio.activeDeals.length
          ? `<div class="list">${portfolio.activeDeals.map((deal) => `
              <article class="list-item">
                <div class="split">
                  <strong>${deal.name}</strong>
                  ${button("open-deal", "開く", "ghost", `data-deal-id="${deal.id}"`)}
                </div>
                <span class="muted">${regionName(deal.region)} / ${deal.industry} / ${deal.stage}</span>
              </article>
            `).join("")}</div>`
          : `<div class="empty-state">まだ保有案件がありません。Inbox から案件化してください。</div>`
      )}
      ${panel(
        "シナジー接続",
        "単独案件ではなく構造価値を見る",
        portfolio.synergyEdges.length
          ? `<div class="list">${portfolio.synergyEdges.map((edge) => `
              <article class="list-item">
                <strong>${edge.fromDealId} → ${edge.toDealId}</strong>
                <span class="muted">${edge.type} / shared ${edge.shared}</span>
              </article>
            `).join("")}</div>`
          : `<div class="empty-state">まだ接続シナジーは発生していません。</div>`
      )}
    </div>
  `;
}

function renderRisk() {
  const incident = getSelectedIncident(state);
  if (!incident) {
    return `
      <div class="page-head">
        <div>
          <h1>Risk Alert</h1>
          <p>リスクは罰ではなく、構造を組み替える見せ場です。</p>
        </div>
      </div>
      ${panel("未発生", "デモ用にリスクを起こせます", button("trigger-risk", "デモリスクを発生", "primary"))}
    `;
  }

  return `
    <div class="page-head">
      <div>
        <h1>Risk Alert</h1>
        <p>短期損失か長期構造かを選びます。</p>
      </div>
    </div>
    <div class="two-col">
      ${panel(
        incident.name,
        `severity ${incident.severity}`,
        `
          <div class="stack">
            <span class="muted">category: ${incident.category}</span>
            <span class="muted">impacted deals: ${incident.targetDealIds.join(", ") || "none"}</span>
          </div>
        `
      )}
      ${panel(
        "対応オプション",
        "リスクは必ず再設計余地とセットで提示する",
        `
          <div class="list">
            ${incident.responseOptions.map((option) => `
              <article class="list-item">
                <div class="split">
                  <strong>${option.label}</strong>
                  ${button("resolve-risk", "実行", "primary", `data-incident-id="${incident.id}" data-response-id="${option.id}"`)}
                </div>
                <span class="muted">cash -${option.cashImpact} / delay ${option.delayImpact} / trust ${option.trustImpact}</span>
              </article>
            `).join("")}
          </div>
        `
      )}
    </div>
  `;
}

function renderYearEnd() {
  const portfolio = computePortfolio(state);
  return `
    <div class="page-head">
      <div>
        <h1>Year End</h1>
        <p>今年の結果を見て、来年はどこに寄せるか決めます。</p>
      </div>
    </div>
    <div class="two-col">
      ${panel(
        "決算レビュー",
        "来期テーマを決める",
        `
          <div class="metric-grid">
            ${metric("営業CF見込み", Math.round(portfolio.cashFlowProjection))}
            ${metric("企業価値", Math.round(portfolio.corporateValueScore))}
          </div>
          <div class="button-row">
            ${button("focus", "Network", "ghost", 'data-focus="network"')}
            ${button("focus", "Capital Efficiency", "ghost", 'data-focus="capital_efficiency"')}
            ${button("focus", "ESG Recovery", "ghost", 'data-focus="esg_recovery"')}
          </div>
          ${button("advance-year", "次年度へ進む", "primary")}
        `
      )}
      ${panel(
        "今年の総括",
        "構造価値の観点で振り返る",
        `
          <div class="list">
            <article class="list-item"><strong>保有案件数</strong><span class="muted">${state.deals.length}</span></article>
            <article class="list-item"><strong>重点方針</strong><span class="muted">${state.player.yearlyFocus}</span></article>
            <article class="list-item"><strong>未解決アラート</strong><span class="muted">${state.incidents.filter((incident) => !incident.resolved).length}</span></article>
          </div>
        `
      )}
    </div>
  `;
}

function renderNav() {
  const items = [
    ["map", "Map"],
    ["intelligence", "Intel"],
    ["inbox", "Inbox"],
    ["deal", "Deal"],
    ["portfolio", "Portfolio"],
    ["risk", "Risk"],
    ["year-end", "Year End"]
  ];

  return items
    .map(
      ([screen, label]) => `
        <button class="nav-btn ${state.screen === screen ? "active" : ""}" data-action="goto" data-screen="${screen}">
          ${label}
        </button>
      `
    )
    .join("");
}

function renderHud() {
  return `
    <div class="hud-grid">
      ${metric("Turn", state.turn, `${state.market.year}年`)}
      ${metric("Phase", state.phase)}
      ${metric("Cash", state.player.cash, "運転資金")}
      ${metric("Invest", state.player.investmentCapacity, "新規投資余力")}
      ${metric("HQ", state.player.hqReputation, "社内評価")}
      ${metric("ESG", state.player.esgScore, "対外信認")}
    </div>
  `;
}

function renderRail() {
  const latestMessage = state.messages[state.messages.length - 1];
  return `
    <aside class="context-rail">
      ${panel(
        "案件レーダー",
        "今の全体状況",
        `
          <div class="tag-row">
            <span class="pill">断片 ${state.fragments.length}</span>
            <span class="pill">リード ${state.leads.length}</span>
            <span class="pill">案件 ${state.deals.length}</span>
            <span class="pill">警報 ${state.incidents.filter((incident) => !incident.resolved).length}</span>
          </div>
          <p class="muted">${latestMessage ? latestMessage.body : "案件の種を集めて、次の一手を決めてください。"}</p>
        `
      )}
      ${panel(
        "最近のメッセージ",
        "意思決定ログ",
        `
          <div class="list compact">
            ${state.messages.slice(-4).reverse().map((message) => `
              <article class="list-item">
                <strong>${message.title}</strong>
                <span class="muted">${message.body}</span>
              </article>
            `).join("")}
          </div>
        `
      )}
    </aside>
  `;
}

function renderScreen() {
  switch (state.screen) {
    case "map":
      return renderMap();
    case "intelligence":
      return renderIntelligence();
    case "inbox":
      return renderInbox();
    case "deal":
      return renderDeal();
    case "negotiation":
      return renderNegotiation();
    case "approval":
      return renderApproval();
    case "portfolio":
      return renderPortfolio();
    case "risk":
      return renderRisk();
    case "year-end":
      return renderYearEnd();
    default:
      return renderTop();
  }
}

function render() {
  app.innerHTML = `
    <div class="shell">
      <header class="topbar">
        <div class="topbar-inner">
          <div class="brand">
            <span class="brand-title">Global Value Architect</span>
            <span class="brand-sub">総合商社シミュレーション</span>
          </div>
          <nav class="nav">${renderNav()}</nav>
        </div>
      </header>
      ${state.screen !== "top" ? `<section class="hud-wrap">${renderHud()}</section>` : ""}
      <main class="main">
        <section class="content">${renderScreen()}</section>
        ${state.screen !== "top" ? renderRail() : ""}
      </main>
    </div>
  `;
}

function getCheckedValues(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value).filter(Boolean);
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;

  const { action } = target.dataset;

  if (action === "new-game") {
    state = resetState();
    state.screen = "map";
    saveState(state);
    render();
    return;
  }

  if (action === "goto") {
    setScreen(state, target.dataset.screen);
    render();
    return;
  }

  if (action === "collect-intelligence") {
    runIntelligenceSweep(state);
    render();
    return;
  }

  if (action === "toggle-pin") {
    togglePinFragment(state, target.dataset.fragmentId);
    render();
    return;
  }

  if (action === "create-deal") {
    createDealFromCandidate(state, target.dataset.candidateId);
    render();
    return;
  }

  if (action === "assign-fragment") {
    assignFragmentToSlot(state, target.dataset.dealId, target.dataset.slotId, target.dataset.fragmentId);
    render();
    return;
  }

  if (action === "assign-partner") {
    assignPartnerToSlot(state, target.dataset.dealId, target.dataset.slotId, target.dataset.partnerId);
    render();
    return;
  }

  if (action === "open-negotiation") {
    state.selectedDealId = target.dataset.dealId;
    openNegotiation(state, target.dataset.dealId, target.dataset.slotId, target.dataset.partnerId);
    render();
    return;
  }

  if (action === "submit-negotiation") {
    const sessionId = target.dataset.sessionId;
    const topic = getCheckedValues("topic")[0] ?? "pricing";
    const offers = getCheckedValues("offer").slice(0, 2);
    const concession = getCheckedValues("concession")[0] ?? "";
    submitNegotiationOffer(state, sessionId, topic, offers, concession || undefined);
    render();
    return;
  }

  if (action === "submit-approval" || action === "confirm-approval") {
    state.selectedDealId = target.dataset.dealId;
    submitApproval(state, target.dataset.dealId);
    render();
    return;
  }

  if (action === "open-deal") {
    state.selectedDealId = target.dataset.dealId;
    state.screen = "deal";
    saveState(state);
    render();
    return;
  }

  if (action === "trigger-risk") {
    triggerRiskIncident(state);
    render();
    return;
  }

  if (action === "resolve-risk") {
    resolveRiskIncident(state, target.dataset.incidentId, target.dataset.responseId);
    render();
    return;
  }

  if (action === "focus") {
    chooseYearlyFocus(state, target.dataset.focus);
    render();
    return;
  }

  if (action === "advance-year") {
    advanceYear(state);
    render();
  }
});

window.addEventListener("storage", () => {
  state = loadState();
  render();
});

render();
