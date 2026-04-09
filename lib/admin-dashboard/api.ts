import { dashboardStatsFallback } from "./mock";
import { mapOrganizationResponse, mapUpdateOrganizationPayload } from "./mappers";
import { OrganizationProfile, StoredUser } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://backend-for-render-ws6z.onrender.com";

export function getStoredUser(): StoredUser | null {
    if(typeof window == "undefined") return null;

    const raw = localStorage.getItem("user");
    if(!raw) return null;

    try {
        return JSON.parse(raw);

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
  return user?.organizationId ?? null;
}

function getAuthHeaders() {
  const token = getAccessToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getOrganizationById(
  organizationId: string
): Promise<OrganizationProfile> {
  const response = await fetch(
    `${API_BASE}/api/v1/organizations/${organizationId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to load organization details.");
  }

  const data = await response.json();
  return mapOrganizationResponse(data);
}

export async function updateOrganizationById(
  organizationId: string,
  organization: OrganizationProfile
): Promise<void> {
  const payload = mapUpdateOrganizationPayload(organization);

  const response = await fetch(
    `${API_BASE}/api/v1/organizations/${organizationId}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update organization.");
  }
}

export async function getDashboardStats() {
  return dashboardStatsFallback;
}