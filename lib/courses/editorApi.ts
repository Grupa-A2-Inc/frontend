import { fetchWithAuth } from "@/lib/fetchWithAuth";

const API_BASE = "https://backend-for-render-ws6z.onrender.com";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("accessToken") ?? "";
}

async function editorFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const callerHeaders = options.headers as Record<string, string> | undefined;
  const defaultHeaders: Record<string, string> = callerHeaders?.["Content-Type"]
    ? {}
    : { "Content-Type": "application/json" };
  const res = await fetchWithAuth(`${API_BASE}${path}`, token, {
    ...options,
    headers: { ...defaultHeaders, ...(callerHeaders ?? {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error ${res.status}`);
  }
  if (res.status === 204) return null as T;
  return res.json();
}

export interface CoursePayload {
  title: string;
  description: string;
  expirationDate?: string;
  status?: "DRAFT" | "PUBLISHED";
}

export async function createCourse(payload: CoursePayload): Promise<{ id: string }> {
  return editorFetch("/api/v1/courses", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateCourse(courseId: string, payload: CoursePayload): Promise<void> {
  return editorFetch(`/api/v1/courses/${courseId}`, { method: "PUT", body: JSON.stringify(payload) });
}

export async function fetchCourseForEditor(courseId: string): Promise<any> {
  return editorFetch(`/api/v1/courses/${courseId}/full-view`);
}

// ---------- Chapters ----------

export async function createChapter(
  courseId: string,
  payload: { title: string; description?: string },
): Promise<{ id: string }> {
  return editorFetch(`/api/v1/courses/${courseId}/chapters`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateChapter(
  chapterId: string,
  payload: { title?: string; description?: string },
): Promise<void> {
  return editorFetch(`/api/v1/chapters/${chapterId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteChapter(chapterId: string): Promise<void> {
  return editorFetch(`/api/v1/chapters/${chapterId}`, { method: "DELETE" });
}

// ---------- Lessons ----------

export async function createLesson(
  chapterId: string,
  payload: { title: string; contentMarkdown?: string },
): Promise<{ id: string }> {
  return editorFetch(`/api/v1/chapters/${chapterId}/lessons`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateLesson(
  lessonId: string,
  payload: { title?: string; content?: string },
): Promise<void> {
  const calls: Promise<unknown>[] = [];
  if (payload.title !== undefined) {
    calls.push(
      editorFetch(`/api/v1/lessons/${lessonId}/metadata`, {
        method: "PATCH",
        body: JSON.stringify({ title: payload.title }),
      }),
    );
  }
  if (payload.content !== undefined) {
    calls.push(
      editorFetch(`/api/v1/lessons/${lessonId}/content`, {
        method: "PATCH",
        headers: { "Content-Type": "text/plain" },
        body: payload.content,
      }),
    );
  }
  await Promise.all(calls);
}

export async function deleteLesson(lessonId: string): Promise<void> {
  return editorFetch(`/api/v1/lessons/${lessonId}`, { method: "DELETE" });
}
