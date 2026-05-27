import { ENDPOINTS } from "@/lib/api-endpoints";
import { API_BASE } from "@/lib/config";
import { fetchCourseFullView } from "@/lib/courses/api";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import {
  TeacherAlert,
  TeacherAlertTestContext,
  TeacherAlertWithContext,
} from "@/lib/teacher-alerts/types";

type CourseSummary = {
  id: string;
  title: string;
};

async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetchWithAuth(`${API_BASE}${path}`, undefined, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized. Please sign in again.");
    }
    if (response.status === 403) {
      throw new Error("You do not have permission to view teacher alerts.");
    }
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

function getList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];

  const objectData = data as Record<string, unknown>;
  const nested = objectData.content ?? objectData.courses ?? objectData.items;

  return Array.isArray(nested) ? nested : [];
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function mapAlert(data: unknown): TeacherAlert {
  const alert = data as Record<string, unknown>;

  return {
    alertId: String(alert.alertId ?? ""),
    testId: String(alert.testId ?? ""),
    professorId: String(alert.professorId ?? ""),
    failureThreshold: asNumber(alert.failureThreshold),
    currentFailureRate: asNumber(alert.currentFailureRate),
    isActive: Boolean(alert.isActive),
  };
}

function mapCourseSummary(data: unknown): CourseSummary | null {
  const course = data as Record<string, unknown>;
  const id = typeof course.id === "string" ? course.id : "";

  if (!id) return null;

  return {
    id,
    title: typeof course.title === "string" ? course.title : "Untitled course",
  };
}

async function fetchTeacherCourseSummaries(): Promise<CourseSummary[]> {
  const data = await apiFetch<unknown>(ENDPOINTS.courses.myCourses);
  return getList(data).map(mapCourseSummary).filter((course): course is CourseSummary => Boolean(course));
}

export async function fetchTeacherAlerts(): Promise<TeacherAlert[]> {
  const data = await apiFetch<unknown>(ENDPOINTS.professors.meAlerts);
  return getList(data).map(mapAlert).filter((alert) => alert.alertId && alert.testId);
}

export async function fetchTeacherAlertContexts(
  testIds: string[],
): Promise<Map<string, TeacherAlertTestContext>> {
  const requestedTestIds = new Set(testIds.filter(Boolean));
  const contexts = new Map<string, TeacherAlertTestContext>();

  if (requestedTestIds.size === 0) return contexts;

  const courses = await fetchTeacherCourseSummaries();
  const results = await Promise.allSettled(
    courses.map(async (courseSummary) => {
      const { course, chapters } = await fetchCourseFullView(courseSummary.id);

      chapters.forEach((chapter) => {
        chapter.lessons.forEach((lesson) => {
          if (!lesson.testId || !requestedTestIds.has(lesson.testId)) return;

          contexts.set(lesson.testId, {
            testId: lesson.testId,
            courseId: course.id,
            courseTitle: course.title || courseSummary.title,
            lessonId: lesson.id,
            lessonTitle: lesson.title || "Untitled lesson",
          });
        });
      });
    }),
  );

  results.forEach((result) => {
    if (result.status === "rejected") {
      console.warn("Failed to enrich alert context", result.reason);
    }
  });

  return contexts;
}

export async function fetchTeacherAlertsDashboardData(): Promise<TeacherAlertWithContext[]> {
  const alerts = await fetchTeacherAlerts();
  const contexts = await fetchTeacherAlertContexts(alerts.map((alert) => alert.testId));

  return alerts.map((alert) => ({
    ...alert,
    context: contexts.get(alert.testId),
  }));
}
