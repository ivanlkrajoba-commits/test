import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getLessonWithCards,
  type CardPayload,
  type LessonSummary,
  updateProgress,
} from "../api/client";
import { Flashcard } from "../components/Flashcard";
import { ProgressIndicator } from "../components/ProgressIndicator";
import { useProfileId } from "../hooks/useProfileId";

export function LessonPlayerPage() {
  const params = useParams();
  const lessonId = Number(params.lessonId);
  const navigate = useNavigate();
  const profileId = useProfileId();

  const [lesson, setLesson] = useState<LessonSummary | null>(null);
  const [cards, setCards] = useState<CardPayload[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(lessonId)) {
      navigate("/study");
      return;
    }

    setLoading(true);
    getLessonWithCards(lessonId, profileId)
      .then((data) => {
        setLesson(data.lesson);
        setCards(data.cards);
        const startIndex = data.progress?.current_card_index ?? 0;
        setCurrentIndex(Math.min(startIndex, Math.max(0, data.cards.length - 1)));
        setCompleted(Boolean(data.progress?.completed));
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [lessonId, navigate, profileId]);

  useEffect(() => {
    if (!lessonId || cards.length === 0) {
      return;
    }
    updateProgress(lessonId, profileId, {
      current_card_index: currentIndex,
      completed: currentIndex >= cards.length - 1,
    }).catch(() => {
      // прогресс не обязателен, не блокируем интерфейс
    });
  }, [lessonId, profileId, currentIndex, cards.length]);

  useEffect(() => {
    if (cards.length === 0) {
      return;
    }
    if (currentIndex >= cards.length - 1) {
      setCompleted(true);
    }
  }, [cards.length, currentIndex]);

  const activeCard = cards[currentIndex];
  const totalCards = cards.length;

  const hasCompletedLesson = useMemo(() => {
    return completed || (totalCards > 0 && currentIndex === totalCards - 1 && flipped);
  }, [completed, currentIndex, flipped, totalCards]);

  function handleSpeak(card: CardPayload) {
    if (card.audio) {
      const audio = new Audio(card.audio);
      void audio.play();
      return;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(card.english_text);
      utterance.lang = "en-US";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }

  function goNext() {
    setFlipped(false);
    setCurrentIndex((index) => Math.min(index + 1, Math.max(cards.length - 1, 0)));
  }

  function goPrev() {
    setFlipped(false);
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }

  if (loading) {
    return <p>Загружаем карточки...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!lesson) {
    return <p>Урок не найден.</p>;
  }

  if (cards.length === 0) {
    return <div className="empty-state">В этом уроке пока нет карточек.</div>;
  }

  return (
    <div>
      <button type="button" className="button secondary" onClick={() => navigate(-1)}>
        ← Назад к урокам
      </button>
      <h2 className="section-title">{lesson.title}</h2>
      <p className="lead">{lesson.description}</p>

      <Flashcard
        card={activeCard}
        flipped={flipped}
        onToggle={() => setFlipped((value) => !value)}
        onSpeak={handleSpeak}
      />

      <div className="carousel-controls">
        <button
          type="button"
          className="button secondary"
          onClick={(event) => {
            event.stopPropagation();
            goPrev();
          }}
          disabled={currentIndex === 0}
        >
          ← Предыдущая
        </button>
        <button
          type="button"
          className="button"
          onClick={(event) => {
            event.stopPropagation();
            goNext();
          }}
          disabled={currentIndex === cards.length - 1}
        >
          Следующая →
        </button>
      </div>

      <ProgressIndicator currentIndex={currentIndex} total={totalCards} />

      {hasCompletedLesson ? (
        <div className="badge" style={{ marginTop: "1.5rem" }}>
          🎉 Урок завершён! Молодец!
        </div>
      ) : null}
    </div>
  );
}
