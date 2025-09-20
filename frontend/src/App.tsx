import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AdminLessonDetailPage } from "./pages/AdminLessonDetailPage";
import { AdminLessonsPage } from "./pages/AdminLessonsPage";
import { HomePage } from "./pages/HomePage";
import { LessonPlayerPage } from "./pages/LessonPlayerPage";
import { StudyLessonListPage } from "./pages/StudyLessonListPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/study" element={<StudyLessonListPage />} />
        <Route path="/study/lessons/:lessonId" element={<LessonPlayerPage />} />
        <Route path="/admin" element={<AdminLessonsPage />} />
        <Route path="/admin/lessons/:lessonId" element={<AdminLessonDetailPage />} />
      </Routes>
    </Layout>
  );
}
