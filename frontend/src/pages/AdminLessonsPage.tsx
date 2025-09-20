import { type FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createLesson, getAdminLessons, type LessonSummary } from "../api/client";

export function AdminLessonsPage() {
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadLessons() {
    setLoading(true);
    try {
      const data = await getAdminLessons();
      setLessons(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLessons();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Укажите название урока");
      return;
    }

    try {
      const lesson = await createLesson({ title: title.trim(), description });
      setLessons((prev) => [...prev, lesson]);
      setTitle("");
      setDescription("");
      setSuccess(`Урок «${lesson.title}» создан`);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <h2 className="section-title">Админка: уроки</h2>
      <p className="lead">
        Добавляйте новые уроки и управляйте карточками. Чтобы загрузить изображения и аудио,
        используйте Django-админку или расширьте API загрузки.
      </p>

      <form onSubmit={handleSubmit} className="card" style={{ marginBottom: "2rem" }}>
        <h3>Создать урок</h3>
        <div className="form-field">
          <label htmlFor="lesson-title">Название</label>
          <input
            id="lesson-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Например, Животные"
          />
        </div>
        <div className="form-field">
          <label htmlFor="lesson-description">Описание</label>
          <textarea
            id="lesson-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Опишите цель урока"
          />
        </div>
        <button type="submit" className="button">
          + Создать урок
        </button>
      </form>

      {error ? <p style={{ color: "red" }}>{error}</p> : null}
      {success ? <p style={{ color: "green" }}>{success}</p> : null}
      {loading ? <p>Загружаем уроки...</p> : null}

      <div className="card-grid">
        {lessons.map((lesson) => (
          <Link key={lesson.id} to={`/admin/lessons/${lesson.id}`} className="card">
            <h3>{lesson.title}</h3>
            <p>{lesson.description}</p>
            <div className="progress-pill">{lesson.total_cards} карточек</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
