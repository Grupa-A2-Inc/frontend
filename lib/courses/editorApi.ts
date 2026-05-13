import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { API_BASE } from "@/lib/config";
import { ENDPOINTS } from "@/lib/api-endpoints";

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
  category: string;
  status?: "DRAFT" | "PUBLISHED";
}

export async function createCourse(payload: CoursePayload): Promise<{ id: string }> {
  return editorFetch(ENDPOINTS.courses.create, { method: "POST", body: JSON.stringify(payload) });
}

export async function updateCourse(courseId: string, payload: CoursePayload): Promise<void> {
  return editorFetch(ENDPOINTS.courses.byId(courseId), { method: "PUT", body: JSON.stringify(payload) });
}

export async function fetchCourseForEditor(courseId: string): Promise<any> {
  return editorFetch(ENDPOINTS.courses.fullView(courseId));
}

// ---------- Chapters ----------

export async function createChapter(
  courseId: string,
  payload: { title: string },
): Promise<{ id: string }> {
  return editorFetch(ENDPOINTS.courses.chapters(courseId), {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: payload.title,
  });
}

export async function updateChapter(
  chapterId: string,
  payload: { title?: string; orderIndex?: number },
): Promise<void> {
  return editorFetch(ENDPOINTS.chapters.byId(chapterId), {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteChapter(chapterId: string): Promise<void> {
  return editorFetch(ENDPOINTS.chapters.byId(chapterId), { method: "DELETE" });
}

// ---------- Lessons ----------

export async function createLesson(
  chapterId: string,
  payload: { title: string; contentMarkdown?: string },
): Promise<{ id: string }> {
  return editorFetch(ENDPOINTS.chapters.lessons(chapterId), {
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
      editorFetch(ENDPOINTS.lessons.metadata(lessonId), {
        method: "PATCH",
        body: JSON.stringify({ title: payload.title }),
      }),
    );
  }
  if (payload.content !== undefined && payload.content !== "") {
    calls.push(
      editorFetch(ENDPOINTS.lessons.content(lessonId), {
        method: "PATCH",
        headers: { "Content-Type": "text/plain" },
        body: payload.content,
      }),
    );
  }
  await Promise.all(calls);
}

export async function deleteLesson(lessonId: string): Promise<void> {
  return editorFetch(ENDPOINTS.lessons.byId(lessonId), { method: "DELETE" });
}

// ---------- Resources ----------

export async function createResource(
  lessonId: string,
  payload: { title: string; url: string },
): Promise<{ id: string }> {
  return editorFetch(ENDPOINTS.lessons.resources(lessonId), {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateResource(
  lessonId: string,
  resourceId: string,
  payload: { title?: string; url?: string },
): Promise<void> {
  return editorFetch(ENDPOINTS.lessons.resourceById(lessonId, resourceId), {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteResource(
  lessonId: string,
  resourceId: string,
): Promise<void> {
  return editorFetch(ENDPOINTS.lessons.resourceById(lessonId, resourceId), {
    method: "DELETE",
  });
}
