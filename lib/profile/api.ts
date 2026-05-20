import { ENDPOINTS } from "@/lib/api-endpoints";
import { API_BASE } from "@/lib/config";
import { fetchWithAuth, getXsrfHeadersAsync } from "@/lib/fetchWithAuth";
import {
  BackendOrganizationResponse,
  BackendUserResponse,
  ChangePasswordPayload,
  UpdateProfilePayload,
} from "@/lib/profile/types";

async function parseError(response: Response, fallback: string): Promise<string> {
  const data = await response.json().catch(() => null);

  if (typeof data?.message === "string") return data.message;
  if (typeof data?.error === "string") return data.error;

  if (response.status === 401) return "Your session expired. Please sign in again.";
  if (response.status === 403) return "You do not have permission to update this profile.";
  if (response.status === 404) return "Profile was not found.";

  return `${fallback} (${response.status})`;
}

export async function fetchUserProfile(
  userId: string,
  token?: string | null
): Promise<BackendUserResponse> {
  const response = await fetchWithAuth(`${API_BASE}${ENDPOINTS.users.byId(userId)}`, token, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to load profile"));
  }

  return (await response.json()) as BackendUserResponse;
}

export async function updateUserProfile(
  userId: string,
  payload: UpdateProfilePayload,
  token?: string | null
): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE}${ENDPOINTS.users.byId(userId)}`, token, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(await getXsrfHeadersAsync()),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to update profile"));
  }
}

export async function changeUserPassword(
  userId: string,
  payload: ChangePasswordPayload,
  token?: string | null
): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE}${ENDPOINTS.users.changePassword(userId)}`, token, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(await getXsrfHeadersAsync()),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to change password"));
  }
}

export async function fetchProfileOrganization(
  organizationId: string,
  token?: string | null
): Promise<BackendOrganizationResponse> {
  const response = await fetchWithAuth(
    `${API_BASE}${ENDPOINTS.organizations.byId(organizationId)}`,
    token,
    {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to load organization"));
  }

  return (await response.json()) as BackendOrganizationResponse;
}
