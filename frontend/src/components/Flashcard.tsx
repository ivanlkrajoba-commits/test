import type { CardPayload } from "../api/client";
import "../styles/flashcard.css";

interface FlashcardProps {
  card: CardPayload;
  flipped: boolean;
  onToggle: () => void;
  onSpeak: (card: CardPayload) => void;
}

export function Flashcard({ card, flipped, onToggle, onSpeak }: FlashcardProps) {
  return (
    <div className="flashcard-container" onClick={onToggle} role="button">
      <div className={`flashcard-inner ${flipped ? "flipped" : ""}`}>
        <div className="flashcard-face front">
          {card.image ? (
            <img
              src={card.image}
              alt={`Иллюстрация для ${card.english_text}`}
              className="card-image"
            />
          ) : null}
          <div className="flashcard-term">{card.english_text}</div>
          <div className="audio-controls">
            <button
              type="button"
              className="button"
              onClick={(event) => {
                event.stopPropagation();
                onSpeak(card);
              }}
            >
              🔊 Озвучить
            </button>
            <button
              type="button"
              className="button secondary"
              onClick={(event) => {
                event.stopPropagation();
                onToggle();
              }}
            >
              ↩ Перевернуть
            </button>
          </div>
        </div>
        <div className="flashcard-face back">
          <div className="flashcard-translation">
            {card.translation || "Перевод не задан"}
          </div>
        </div>
      </div>
    </div>
  );
}
