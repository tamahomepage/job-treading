import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { NegotiationOfferBuilder } from "../../features/negotiation/components/NegotiationOfferBuilder";
import { useGameStore } from "../../game/state/gameStore";
import { routes } from "../../shared/constants/routes";
import { MetricCard } from "../../shared/ui/MetricCard";
import { Panel } from "../../shared/ui/Panel";

export function NegotiationPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const game = useGameStore((state) => state.game);
  const masterData = useGameStore((state) => state.masterData);
  const submitNegotiationOffer = useGameStore((state) => state.submitNegotiationOffer);
  const session = game.negotiations.find((entry) => entry.id === sessionId);
  const partner = session
    ? masterData.partners.find((entry) => entry.id === session.partnerId)
    : undefined;

  const [topic, setTopic] = useState("pricing");
  const [offers, setOffers] = useState<string[]>(["guarantee"]);
  const [concession, setConcession] = useState<string | undefined>("board_seat");

  if (!session || !partner) {
    return <div className="emptyState">交渉セッションが見つかりません。</div>;
  }

  return (
    <div className="page">
      <div className="pageHeader">
        <div className="stack" style={{ gap: 6 }}>
          <h1 className="pageTitle">Negotiation</h1>
          <p className="pageSubtitle">
            相手の重視軸を読み、譲歩と提案の組み合わせで合意を狙います。
          </p>
        </div>
        <Link className="buttonGhost" to={routes.deal(session.dealId)}>
          Dealへ戻る
        </Link>
      </div>

      <div className="metricRow">
        <MetricCard label="Round" value={`${session.round}/${session.maxRounds}`} />
        <MetricCard
          label="Acceptance"
          value={Math.round(session.acceptancePreview)}
          tone={session.acceptancePreview >= 70 ? "good" : "warn"}
        />
      </div>

      <div className="gridTwo">
        <Panel title={partner.name} subtitle={`requested slot: ${session.requestedSlot}`}>
          <div className="stack">
            <span className="muted">type: {partner.type}</span>
            <span className="muted">
              preference: {Object.keys(partner.preferenceWeights).join(", ")}
            </span>
            <span className="muted">red lines: {partner.redLines.join(", ") || "none"}</span>
          </div>
        </Panel>

        <Panel title="交渉ログ" subtitle="相手の反応を読む">
          {session.log.length > 0 ? (
            <div className="list">
              {session.log.map((entry, index) => (
                <div key={`${entry.round}_${index}`} className="listItem">
                  <strong>{entry.speaker}</strong>
                  <span className="muted">{entry.text}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="emptyState">まだオファーを送っていません。</div>
          )}
        </Panel>
      </div>

      <Panel title="Offer Builder" subtitle="議題1つ、提案2つ、譲歩1つの形で作る">
        <NegotiationOfferBuilder
          topic={topic}
          offers={offers}
          concession={concession}
          onTopicChange={setTopic}
          onToggleOffer={(offer) =>
            setOffers((current) =>
              current.includes(offer)
                ? current.filter((entry) => entry !== offer)
                : current.length >= 2
                  ? [current[1], offer]
                  : [...current, offer]
            )
          }
          onConcessionChange={(nextConcession) =>
            setConcession((current) =>
              current === nextConcession ? undefined : nextConcession
            )
          }
          onSubmit={() => {
            submitNegotiationOffer({
              sessionId: session.id,
              topic,
              offers,
              concession
            });
            navigate(routes.deal(session.dealId));
          }}
        />
      </Panel>
    </div>
  );
}
