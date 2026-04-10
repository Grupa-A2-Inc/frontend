import { dashboardStatsFallback } from "./mock";
import {
  mapOrganizationResponse,
  mapUpdateOrganizationPayload,
} from "./mappers";
import {
  AdminDashboardStats,
  OrganizationProfile,
  StoredUser,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://backend-for-render-ws6z.onrender.com";

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
  const token = getAccessToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getOrganizationById(
  organizationId: string
): Promise<OrganizationProfile> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Access token was not found. Please sign in again.");
  }

  try {
    const response = await fetch(
      `${API_BASE}/api/v1/organizations/${organizationId}`,
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
  organization: OrganizationProfile
): Promise<void> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Access token was not found. Please sign in again.");
  }

  const payload = mapUpdateOrganizationPayload(organization);

  try {
    const response = await fetch(
      `${API_BASE}/api/v1/organizations/${organizationId}`,
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
  return dashboardStatsFallback;
}