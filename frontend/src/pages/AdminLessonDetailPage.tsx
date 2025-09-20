import { type FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createCard,
  getAdminLessonWithCards,
  type CardPayload,
  type LessonSummary,
} from "../api/client";

export function AdminLessonDetailPage() {
  const params = useParams();
  const lessonId = Number(params.lessonId);
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<LessonSummary | null>(null);
  const [cards, setCards] = useState<CardPayload[]>([]);
  const [englishText, setEnglishText] = useState("");
  const [translation, setTranslation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(lessonId)) {
      navigate("/admin");
      return;
    }

    setLoading(true);
    getAdminLessonWithCards(lessonId)
      .then((data) => {
        setLesson(data.lesson);
        setCards(data.cards);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [lessonId, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!englishText.trim() || !translation.trim()) {
      setError("Заполните слово и перевод");
      return;
    }

    try {
      const card = await createCard(lessonId, {
        english_text: englishText.trim(),
        translation: translation.trim(),
      });
      setCards((prev) => [...prev, card]);
      setEnglishText("");
      setTranslation("");
      setSuccess(`Карточка «${card.english_text}» добавлена`);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (loading && !lesson) {
    return <p>Загружаем урок...</p>;
  }

  if (error && !lesson) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!lesson) {
    return <p>Урок не найден.</p>;
  }

  return (
    <div>
      <button type="button" className="button secondary" onClick={() => navigate(-1)}>
        ← Назад к списку уроков
      </button>
      <h2 className="section-title">{lesson.title}</h2>
      <p className="lead">{lesson.description}</p>

      <form onSubmit={handleSubmit} className="card" style={{ marginTop: "1.5rem" }}>
        <h3>Добавить карточку</h3>
        <div className="form-field">
          <label htmlFor="english-text">Английское слово или фраза</label>
          <input
            id="english-text"
            value={englishText}
            onChange={(event) => setEnglishText(event.target.value)}
            placeholder="Например, cat"
          />
        </div>
        <div className="form-field">
          <label htmlFor="translation">Перевод</label>
          <input
            id="translation"
            value={translation}
            onChange={(event) => setTranslation(event.target.value)}
            placeholder="Например, кот"
          />
        </div>
        <button type="submit" className="button">
          + Добавить карточку
        </button>
      </form>

      {error ? <p style={{ color: "red" }}>{error}</p> : null}
      {success ? <p style={{ color: "green" }}>{success}</p> : null}

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Английское слово</th>
            <th>Перевод</th>
            <th>Медиа</th>
          </tr>
        </thead>
        <tbody>
          {cards.map((card, index) => (
            <tr key={card.id}>
              <td>{index + 1}</td>
              <td>{card.english_text}</td>
              <td>{card.translation}</td>
              <td>
                {card.image ? <span className="badge">🖼 Изображение</span> : "—"}
                {card.audio ? <span className="badge"> 🔊 Аудио</span> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
