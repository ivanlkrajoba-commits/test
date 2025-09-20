export interface LessonProgress {
  profile: string;
  lesson: number;
  current_card_index: number;
  completed: boolean;
  updated_at: string;
  total_cards?: number;
}

export interface LessonSummary {
  id: number;
  title: string;
  description: string;
  total_cards: number;
  cover_image?: string | null;
  progress?: LessonProgress | null;
}

export interface CardPayload {
  id: number;
  lesson_id: number;
  english_text: string;
  translation: string;
  order: number;
  image?: string | null;
  audio?: string | null;
}

export interface LessonWithCards {
  lesson: LessonSummary;
  cards: CardPayload[];
  progress?: LessonProgress | null;
}

const API_BASE_URL = ((import.meta.env.VITE_API_BASE_URL as string | undefined) || "/api").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API request failed (${response.status} ${response.statusText}): ${errorText}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function getLessons(profileId?: string): Promise<LessonSummary[]> {
  const params = profileId ? `?profile=${encodeURIComponent(profileId)}` : "";
  const data = await request<{ lessons: LessonSummary[] }>(`/lessons/${params}`);
  return data.lessons;
}

export async function getLessonWithCards(
  lessonId: number,
  profileId?: string,
): Promise<LessonWithCards> {
  const params = profileId ? `?profile=${encodeURIComponent(profileId)}` : "";
  return await request<LessonWithCards>(`/lessons/${lessonId}/cards/${params}`);
}

export async function updateProgress(
  lessonId: number,
  profileId: string,
  payload: Partial<Pick<LessonProgress, "current_card_index" | "completed">>,
): Promise<LessonProgress> {
  return await request<LessonProgress>(`/lessons/${lessonId}/progress/`, {
    method: "POST",
    body: JSON.stringify({ profile: profileId, ...payload }),
  });
}

export async function createLesson(payload: {
  title: string;
  description?: string;
}): Promise<LessonSummary> {
  return await request<LessonSummary>("/admin/lessons/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAdminLessons(): Promise<LessonSummary[]> {
  const data = await request<{ lessons: LessonSummary[] }>("/admin/lessons/");
  return data.lessons;
}

export async function getAdminLessonWithCards(
  lessonId: number,
): Promise<LessonWithCards> {
  return await request<LessonWithCards>(`/admin/lessons/${lessonId}/cards/`);
}

export async function createCard(
  lessonId: number,
  payload: Pick<CardPayload, "english_text" | "translation"> & { order?: number },
): Promise<CardPayload> {
  return await request<CardPayload>(`/admin/lessons/${lessonId}/cards/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCard(
  cardId: number,
  payload: Partial<Pick<CardPayload, "english_text" | "translation" | "order">>,
): Promise<CardPayload> {
  return await request<CardPayload>(`/admin/cards/${cardId}/`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
