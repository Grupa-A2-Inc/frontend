import { ENDPOINTS } from "@/lib/api-endpoints";
import { API_BASE } from "@/lib/config";
import { CourseVisibility } from "@/lib/courses/types";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { fetchMyCourses } from "./api";
import { StudentCourse } from "./types";

const ENROLLMENT_LOOKUP_PAGE_SIZE = 50;

async function certificateError(response: Response): Promise<Error> {
  if (response.status === 403) {
    return new Error("This certificate is not available for this course.");
  }

  if (response.status === 404) {
    return new Error("Your course enrollment could not be found.");
  }

  const body = await response.json().catch(() => null);
  const message =
    typeof body?.message === "string"
      ? body.message
      : `Could not download certificate (${response.status}).`;

  return new Error(message);
}

export async function downloadCertificatePdf(
  token: string,
  enrollmentId: string
): Promise<Blob> {
  const response = await fetchWithAuth(
    `${API_BASE}${ENDPOINTS.enrollments.certificate(enrollmentId)}`,
    token,
    { headers: { Accept: "application/pdf" } }
  );

  if (!response.ok) {
    throw await certificateError(response);
  }

  return response.blob();
}

export async function fetchCertificateCourseVisibility(
  token: string,
  courseId: string
): Promise<CourseVisibility> {
  const response = await fetchWithAuth(
    `${API_BASE}${ENDPOINTS.courses.fullView(courseId)}`,
    token
  );

  if (!response.ok) {
    throw new Error("Could not check certificate availability.");
  }

  const course = (await response.json()) as { visibility?: unknown };
  if (course.visibility !== "PUBLIC" && course.visibility !== "PRIVATE") {
    throw new Error("Could not check certificate availability.");
  }

  return course.visibility;
}

export async function findEnrollmentForCourse(
  token: string,
  courseId: string
): Promise<StudentCourse | null> {
  let page = 0;

  while (true) {
    const result = await fetchMyCourses(token, page, ENROLLMENT_LOOKUP_PAGE_SIZE);
    const enrollment = result.content.find((course) => course.id === courseId);

    if (enrollment) {
      return enrollment;
    }

    if (result.last || page + 1 >= result.totalPages) {
      return null;
    }

    page += 1;
  }
}
