import { useEffect, useState } from "react";
import { getLessons, type LessonSummary } from "../api/client";
import { LessonCard } from "../components/LessonCard";
import { useProfileId } from "../hooks/useProfileId";

export function StudyLessonListPage() {
  const profileId = useProfileId();
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getLessons(profileId)
      .then(setLessons)
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [profileId]);

  return (
    <div>
      <h2 className="section-title">Выбери урок</h2>
      <p className="lead">Твой профиль: {profileId}</p>
      {loading ? <p>Загружаем уроки...</p> : null}
      {error ? <p style={{ color: "red" }}>{error}</p> : null}
      {!loading && lessons.length === 0 ? (
        <div className="empty-state">Пока нет уроков. Попроси взрослого добавить их в админке.</div>
      ) : null}
      <div className="card-grid">
        {lessons.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} to={`/study/lessons/${lesson.id}`} />
        ))}
      </div>
    </div>
  );
}
