import { Link } from "react-router-dom";
import type { LessonSummary } from "../api/client";

interface LessonCardProps {
  lesson: LessonSummary;
  to: string;
}

export function LessonCard({ lesson, to }: LessonCardProps) {
  const totalCardsLabel = lesson.total_cards === 1 ? "1 карточка" : `${lesson.total_cards} карточек`;
  const progress = lesson.progress;

  return (
    <Link to={to} className="card">
      {lesson.cover_image ? (
        <img src={lesson.cover_image} alt="Обложка урока" className="lesson-cover" />
      ) : null}
      <h3>{lesson.title}</h3>
      <p>{lesson.description}</p>
      <div className="progress-pill">{totalCardsLabel}</div>
      {progress ? (
        <div className="badge">
          Прогресс: {progress.current_card_index + 1}/{progress.total_cards ?? lesson.total_cards}
        </div>
      ) : null}
    </Link>
  );
}
