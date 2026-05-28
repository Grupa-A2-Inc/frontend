import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { API_BASE } from "@/lib/config";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { normalizeContentMarkdown } from "./content";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("accessToken") ?? "";
}

async function editorFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const callerHeaders = options.headers as Record<string, string> | undefined;
  const headers = { "Content-Type": "application/json", ...(callerHeaders ?? {}) };
  const res = await fetchWithAuth(`${API_BASE}${path}`, token, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error ${res.status}`);
  }

  if (res.status === 204) return null as T;
  return res.json();
}

export interface LessonResourceDto {
  id: string;
  lessonId?: string;
  title: string;
  url: string;
}

export interface LessonFullViewDto {
  id: string;
  chapterId?: string;
  testId?: string | null;
  title: string;
  contentMarkdown?: string | null;
  orderIndex?: number | null;
  lessonResources?: LessonResourceDto[] | null;
}

export interface ChapterFullViewDto {
  id: string;
  title: string;
  orderIndex?: number | null;
  lessons?: LessonFullViewDto[] | null;
}

export interface CourseFullViewDto {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  status?: "DRAFT" | "PUBLISHED" | null;
  chapters?: ChapterFullViewDto[] | null;
}

export interface CreateLessonResourceDto {
  title: string;
  url: string;
}

export interface CreateLessonDto {
  title: string;
  contentMarkdown?: string;
  orderIndex: number;
  lessonResources: CreateLessonResourceDto[];
}

export interface CreateChapterDto {
  title: string;
  orderIndex: number;
  lessons: CreateLessonDto[];
}

interface CourseMetadataPayload {
  title: string;
  description: string;
  category: string;
  status: "DRAFT" | "PUBLISHED";
}

export interface CreateCoursePayload extends CourseMetadataPayload {
  chapters: CreateChapterDto[];
}

export type UpdateCoursePayload = CourseMetadataPayload;

interface CourseSummaryDto {
  id?: string;
  category?: string | null;
}

interface CoursePageDto {
  content?: CourseSummaryDto[];
  courses?: CourseSummaryDto[];
  items?: CourseSummaryDto[];
  totalPages?: number;
}

function getCourses(data: CoursePageDto | CourseSummaryDto[]): CourseSummaryDto[] {
  if (Array.isArray(data)) return data;
  return data.content ?? data.courses ?? data.items ?? [];
}

async function fetchCourseSummaryForEditor(courseId: string): Promise<CourseSummaryDto | null> {
  let page = 0;
  let totalPages = 1;

  while (page < totalPages) {
    const data = await editorFetch<CoursePageDto | CourseSummaryDto[]>(
      `${ENDPOINTS.courses.myCourses}?page=${page}&size=100`,
    );
    const match = getCourses(data).find(course => course.id === courseId);

    if (match) return match;
    if (Array.isArray(data)) return null;

    totalPages = data.totalPages ?? totalPages;
    page += 1;
  }

  return null;
}

export async function createCourse(payload: CreateCoursePayload): Promise<CourseFullViewDto> {
  return editorFetch(ENDPOINTS.courses.create, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCourse(courseId: string, payload: UpdateCoursePayload): Promise<void> {
  return editorFetch(ENDPOINTS.courses.byId(courseId), {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function fetchCourseForEditor(courseId: string): Promise<CourseFullViewDto> {
  const [fullView, summary] = await Promise.all([
    editorFetch<CourseFullViewDto>(ENDPOINTS.courses.fullView(courseId)),
    fetchCourseSummaryForEditor(courseId).catch(() => null),
  ]);
  const fullViewCategory = fullView.category?.trim() ?? "";

  return {
    ...fullView,
    category: fullViewCategory || summary?.category || "",
    chapters: (fullView.chapters ?? []).map(chapter => ({
      ...chapter,
      lessons: (chapter.lessons ?? []).map(lesson => ({
        ...lesson,
        contentMarkdown: normalizeContentMarkdown(lesson.contentMarkdown),
      })),
    })),
  };
}

export async function createChapter(courseId: string, title: string): Promise<{ id: string }> {
  return editorFetch(ENDPOINTS.courses.chapters(courseId), {
    method: "POST",
    body: JSON.stringify(title),
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
  payload: { title?: string; orderIndex?: number; contentMarkdown?: string },
): Promise<void> {
  const calls: Promise<unknown>[] = [];

  if (payload.title !== undefined || payload.orderIndex !== undefined) {
    calls.push(
      editorFetch(ENDPOINTS.lessons.metadata(lessonId), {
        method: "PATCH",
        body: JSON.stringify({ title: payload.title, orderIndex: payload.orderIndex }),
      }),
    );
  }

  if (payload.contentMarkdown !== undefined) {
    calls.push(
      editorFetch(ENDPOINTS.lessons.content(lessonId), {
        method: "PATCH",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: payload.contentMarkdown,
      }),
    );
  }

  await Promise.all(calls);
}

export async function deleteLesson(lessonId: string): Promise<void> {
  return editorFetch(ENDPOINTS.lessons.byId(lessonId), { method: "DELETE" });
}

export async function createResource(
  lessonId: string,
  payload: CreateLessonResourceDto,
): Promise<{ id: string }> {
  return editorFetch(ENDPOINTS.lessons.resources(lessonId), {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateResource(
  lessonId: string,
  resourceId: string,
  payload: CreateLessonResourceDto,
): Promise<void> {
  return editorFetch(ENDPOINTS.lessons.resourceById(lessonId, resourceId), {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteResource(lessonId: string, resourceId: string): Promise<void> {
  return editorFetch(ENDPOINTS.lessons.resourceById(lessonId, resourceId), {
    method: "DELETE",
  });
}
