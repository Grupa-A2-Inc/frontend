import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { CourseStatus, CourseVisibility } from "@/lib/courses/types";
import { PaginatedCourses, StudentCourse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.adaptiveelearning.online";

type PublicCourseDto = {
  id?: string;
  title?: string;
  description?: string;
  category?: string;
  status?: CourseStatus;
  visibility?: CourseVisibility;
  createdBy?: string;
};

type EnrolledCourseDto = {
  unrollmentId?: string;
  enrollmentId?: string;
  courseId?: string;
  courseTitle?: string;
  courseCategory?: string;
  enrolledAt?: string;
  progressPercent?: number;
  completedAt?: string;
};

type BackendPage<T> = Omit<PaginatedCourses, "content"> & {
  content?: T[];
};

async function parseError(response: Response, fallback: string): Promise<Error> {
  const body = await response.json().catch(() => null);
  const message =
    typeof body?.message === "string"
      ? body.message
      : `${fallback} (${response.status})`;

  return new Error(message);
}

function toPage<T>(
  data: BackendPage<T>,
  content: StudentCourse[]
): PaginatedCourses {
  return {
    content,
    totalPages: data.totalPages ?? 0,
    totalElements: data.totalElements ?? content.length,
    numberOfElements: data.numberOfElements ?? content.length,
    size: data.size ?? content.length,
    number: data.number ?? 0,
    first: data.first ?? true,
    last: data.last ?? true,
    empty: data.empty ?? content.length === 0,
  };
}

function mapPublicCourse(course: PublicCourseDto): StudentCourse {
  return {
    id: course.id ?? "",
    title: course.title ?? "Untitled course",
    description: course.description ?? "",
    category: course.category ?? "Uncategorized",
    status: course.status ?? "PUBLISHED",
    visibility: course.visibility ?? "PUBLIC",
    createdBy: course.createdBy ?? "",
  };
}

function mapEnrolledCourse(course: EnrolledCourseDto): StudentCourse {
  return {
    id: course.courseId ?? "",
    title: course.courseTitle ?? "Untitled course",
    description: "Continue learning where you left off.",
    category: course.courseCategory ?? "Uncategorized",
    status: "PUBLISHED",
    visibility: "PRIVATE",
    createdBy: "",
    enrollmentId: course.enrollmentId ?? course.unrollmentId,
    enrolledAt: course.enrolledAt,
    progressPercent: course.progressPercent ?? 0,
    completedAt: course.completedAt,
  };
}

//aduc cursurile disponibile pt tab ul Discover (GET /api/v1/courses/public)
export async function fetchPublicCourses(
  token: string,
  page: number = 0,
  size: number = 10
): Promise<PaginatedCourses> {
  const response = await fetchWithAuth(
    `${API_URL}/api/v1/courses/public?page=${page}&size=${size}`,
    token
  );
  if (!response.ok) {
    throw await parseError(response, "Failed to fetch public courses");
  }
  const data = (await response.json()) as BackendPage<PublicCourseDto>;
  return toPage(data, (data.content ?? []).map(mapPublicCourse).filter((c) => c.id));
}

//aduc cursurile la care studentul este inscris (GET /api/v1/students/me/courses)
export async function fetchMyCourses(
  token: string,
  page: number = 0,
  size: number = 10
): Promise<PaginatedCourses> {
  const response = await fetchWithAuth(
    `${API_URL}/api/v1/students/me/courses?page=${page}&size=${size}&sort=enrolledAt,desc`,
    token
  );
  if (!response.ok) {
    throw await parseError(response, "Failed to fetch my courses");
  }
  const data = (await response.json()) as BackendPage<EnrolledCourseDto>;
  return toPage(data, (data.content ?? []).map(mapEnrolledCourse).filter((c) => c.id));
}

export async function enrollInCourse(
  token: string,
  courseId: string
): Promise<void> {
  const response = await fetchWithAuth(
    `${API_URL}/api/v1/courses/${courseId}/enroll`,
    token,
    { method: "POST" }
  );

  if (!response.ok && response.status !== 409) {
    throw await parseError(response, "Failed to enroll in course");
  }
}

export async function unenrollFromCourse(
  token: string,
  courseId: string
): Promise<void> {
  const response = await fetchWithAuth(
    `${API_URL}/api/v1/courses/${courseId}/unenroll`,
    token,
    { method: "DELETE" }
  );

  if (!response.ok) {
    throw await parseError(response, "Failed to unenroll from course");
  }
}
