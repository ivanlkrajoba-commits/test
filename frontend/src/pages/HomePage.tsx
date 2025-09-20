import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div>
      <h1 className="section-title">Добро пожаловать в English Buddy</h1>
      <p className="lead">
        Приложение помогает детям учить английские слова и фразы с помощью красочных
        карточек, аудио-озвучки и понятного индикатора прогресса. Взрослые могут
        наполнять уроки в удобной админке.
      </p>
      <div style={{ marginTop: "2rem", display: "flex", gap: "1.5rem" }}>
        <Link to="/study" className="button">
          🚀 Изучай!
        </Link>
        <Link to="/admin" className="button secondary">
          🛠 Админка
        </Link>
      </div>
    </div>
  );
}
