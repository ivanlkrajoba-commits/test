import { Link } from "react-router-dom";
import "../styles/layout.css";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">
          English Buddy
        </Link>
        <nav className="main-nav">
          <Link to="/study">Изучай!</Link>
          <Link to="/admin">Админка</Link>
        </nav>
      </header>
      <main className="app-content">{children}</main>
      <footer className="app-footer">
        Сделано для обучения детей английскому языку.
      </footer>
    </div>
  );
}
