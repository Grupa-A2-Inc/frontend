import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { PaginatedCourses } from "./types";

//const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_URL = "https://api.adaptiveelearning.online";

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
    throw new Error("Failed to fetch public courses");
  }
  return response.json();
}

//aduc cursurile la care studentul este inscris (GET /api/v1/courses/my-courses)
export async function fetchMyCourses(
  token: string,
  page: number = 0,
  size: number = 10
): Promise<PaginatedCourses> {
  const response = await fetchWithAuth(
    `${API_URL}/api/v1/courses/my-courses?page=${page}&size=${size}`,
    token
  );
  if (!response.ok) {
    throw new Error("Failed to fetch my courses");
  }
  return response.json();
}