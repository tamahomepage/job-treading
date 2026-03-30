interface NegotiationOfferBuilderProps {
  topic: string;
  offers: string[];
  concession?: string;
  onTopicChange: (topic: string) => void;
  onToggleOffer: (offer: string) => void;
  onConcessionChange: (concession: string) => void;
  onSubmit: () => void;
}

const topics = ["pricing", "guarantee", "local_content", "operating_control"];
const offerPool = [
  "pricing",
  "guarantee",
  "local_content",
  "offtake_floor",
  "esg_mitigation",
  "long_tenor"
];
const concessions = ["board_seat", "local_content", "esg_mitigation"];

export function NegotiationOfferBuilder({
  topic,
  offers,
  concession,
  onTopicChange,
  onToggleOffer,
  onConcessionChange,
  onSubmit
}: NegotiationOfferBuilderProps) {
  return (
    <div className="stack">
      <div className="stack">
        <span className="muted">議題</span>
        <div className="buttonRow">
          {topics.map((item) => (
            <button
              key={item}
              className={topic === item ? "buttonSecondary" : "buttonGhost"}
              onClick={() => onTopicChange(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="stack">
        <span className="muted">提案</span>
        <div className="buttonRow">
          {offerPool.map((offer) => (
            <button
              key={offer}
              className={offers.includes(offer) ? "buttonSecondary" : "buttonGhost"}
              onClick={() => onToggleOffer(offer)}
              type="button"
            >
              {offer}
            </button>
          ))}
        </div>
      </div>

      <div className="stack">
        <span className="muted">譲歩</span>
        <div className="buttonRow">
          {concessions.map((item) => (
            <button
              key={item}
              className={concession === item ? "buttonSecondary" : "buttonGhost"}
              onClick={() => onConcessionChange(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <button className="buttonPrimary" onClick={onSubmit} type="button">
        オファー送信
      </button>
    </div>
  );
}
