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

const DASHBOARD_COUNT_PAGE_SIZE = 1000;
const MAX_DASHBOARD_COUNT_PAGES = 1000;

function getCollectionItems(data: unknown): unknown[] | null {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return null;

  const record = data as Record<string, unknown>;
  const list =
    record.data ??
    record.content ??
    record.users ??
    record.items ??
    record.classrooms;
  return Array.isArray(list) ? list : null;
}

function getReportedTotal(data: unknown): number | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;

  const total = (data as Record<string, unknown>).totalElements;
  return typeof total === "number" && total >= 0 ? total : null;
}

function getItemIds(items: unknown[]): string[] | null {
  const ids = items.map((item) => {
    if (!item || typeof item !== "object") return "";
    return String((item as Record<string, unknown>).id ?? "");
  });

  return ids.every(Boolean) ? ids : null;
}

async function getScopedCollectionCount(
  endpoint: string,
  token: string,
  filters: Record<string, string> = {}
): Promise<number | null> {
  const uniqueIds = new Set<string>();

  for (let page = 0; page < MAX_DASHBOARD_COUNT_PAGES; page += 1) {
    const query = new URLSearchParams({
      ...filters,
      page: String(page),
      size: String(DASHBOARD_COUNT_PAGE_SIZE),
    });
    const response = await fetchWithAuth(`${API_BASE}${endpoint}?${query.toString()}`, token, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data = await response.json();
    const reportedTotal = getReportedTotal(data);
    if (reportedTotal !== null) return reportedTotal;

    const items = getCollectionItems(data);
    if (!items) return null;
    if (items.length === 0) return uniqueIds.size;

    const itemIds = getItemIds(items);
    if (!itemIds) return null;

    const countBeforePage = uniqueIds.size;
    itemIds.forEach((id) => uniqueIds.add(id));

    if (page > 0 && uniqueIds.size === countBeforePage) return uniqueIds.size;
  }

  return null;
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
    const [totalStudents, totalTeachers, totalClasses] = await Promise.all([
      getScopedCollectionCount(ENDPOINTS.users.organization, token, {
        role: "STUDENT",
      }),
      getScopedCollectionCount(ENDPOINTS.users.organization, token, {
        role: "TEACHER",
      }),
      getScopedCollectionCount(ENDPOINTS.classrooms.list, token),
    ]);

    if (totalStudents === null) {
      warnings.push("Could not load the organization student count.");
    }

    if (totalTeachers === null) {
      warnings.push("Could not load the organization teacher count.");
    }

    if (totalClasses === null) {
      warnings.push("Could not load the organization class count.");
    }

    return {
      totalStudents,
      totalTeachers,
      totalClasses,
      warnings,
    };
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Failed to fetch dashboard stats.");
  }
}
