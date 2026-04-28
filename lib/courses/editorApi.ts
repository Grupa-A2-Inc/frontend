const API_BASE = "https://backend-for-render-ws6z.onrender.com";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("accessToken") ?? "";
}

async function editorFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
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

export interface NodePayload {
  parentNodeId?: string;
  nodeType: string;
  resourceType?: string;
  title: string;
  description?: string;
  content?: string;
  fileUrl?: string;
}

export interface UpdateNodePayload {
  title?: string;
  description?: string;
  content?: string;
  fileUrl?: string;
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

export async function createCourseNode(courseId: string, payload: NodePayload): Promise<{ id: string }> {
  return editorFetch(`/api/v1/courses/${courseId}/nodes`, { method: "POST", body: JSON.stringify(payload) });
}

export async function updateCourseNode(nodeId: string, payload: UpdateNodePayload): Promise<void> {
  return editorFetch(`/api/v1/course-nodes/${nodeId}`, { method: "PUT", body: JSON.stringify(payload) });
}

export async function deleteCourseNode(nodeId: string): Promise<void> {
  return editorFetch(`/api/v1/course-nodes/${nodeId}`, { method: "DELETE" });
}

export async function moveCourseNode(nodeId: string, direction: "UP" | "DOWN"): Promise<void> {
  return editorFetch(`/api/v1/course-nodes/${nodeId}/move`, {
    method: "POST",
    body: JSON.stringify({ direction }),
  });
}
