import {
  mapOrganizationResponse,
} from "./mappers";
import {
  AdminDashboardStats,
  OrganizationProfile,
  StoredUser,
  UpdateOrganizationPayload,
} from "./types";
import { API_BASE } from "@/lib/config";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

type DashboardUserRow = {
  roleName?: unknown;
  role?: unknown;
};

function getDataList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];

  const list = (data as Record<string, unknown>).data;
  return Array.isArray(list) ? list : [];
}

function getUserRole(user: unknown): string {
  if (!user || typeof user !== "object") return "";

  const row = user as DashboardUserRow;
  return String(row.roleName ?? row.role ?? "").toUpperCase();
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem("user");
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export function getOrganizationIdFromStorage(): string | null {
  const user = getStoredUser();
  return user?.organizationId ? String(user.organizationId) : null;
}

function getAuthHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
  };
}

export async function getOrganizationById(
  organizationId: string,
): Promise<OrganizationProfile> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Access token was not found. Please sign in again.");
  }

  try {
    const response = await fetchWithAuth(
      `${API_BASE}${ENDPOINTS.organizations.byId(organizationId)}`,
      token,
      {
        method: "GET",
        headers: getAuthHeaders(),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized. Please sign in again.");
      }

      if (response.status === 403) {
        throw new Error("You do not have permission to access this organization.");
      }

      if (response.status === 404) {
        throw new Error("Organization was not found.");
      }

      throw new Error("Failed to load organization details.");
    }

    const data = await response.json();
    return mapOrganizationResponse(data);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Failed to fetch organization details.");
  }
}

export async function updateOrganizationById(
  organizationId: string,
  payload: UpdateOrganizationPayload
): Promise<void> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Access token was not found. Please sign in again.");
  }

  try {
    const response = await fetchWithAuth(
      `${API_BASE}${ENDPOINTS.organizations.byId(organizationId)}`,
      token,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized. Please sign in again.");
      }

      if (response.status === 403) {
        throw new Error("You do not have permission to update this organization.");
      }

      throw new Error("Failed to update organization.");
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Failed to update organization.");
  }
}

export async function getDashboardStats(): Promise<AdminDashboardStats> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Access token was not found. Please sign in again.");
  }

  const warnings: string[] = [];

  try {
    const [usersRes, coursesRes] = await Promise.all([
      fetchWithAuth(`${API_BASE}${ENDPOINTS.users.list}`, token, {
        headers: getAuthHeaders(),
        cache: "no-store",
      }),
      fetchWithAuth(`${API_BASE}/api/courses/public`, token, {
        headers: getAuthHeaders(),
        cache: "no-store",
      }),
    ]);

    let totalStudents = 0;
    let totalTeachers = 0;

    if (usersRes.ok) {
      const users = await usersRes.json();
      const list = getDataList(users);

      totalStudents = list.filter(
        (user) => getUserRole(user) === "STUDENT"
      ).length;

      totalTeachers = list.filter(
        (user) => getUserRole(user) === "TEACHER"
      ).length;
    } else {
      warnings.push("Could not load users data.");
    }

    let totalCourses = 0;

    if (coursesRes.ok) {
      const courses = await coursesRes.json();
      const list = getDataList(courses);

      totalCourses = list.length;
    } else {
      warnings.push("Could not load courses data.");
    }

    return {
      totalStudents,
      totalTeachers,
      totalClasses: 0,
      totalCourses,
      warnings,
    };
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Failed to fetch dashboard stats.");
  }
}
