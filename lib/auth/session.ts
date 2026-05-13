import { normalizeUserRole } from "@/lib/auth/roles";
import type { AuthResponse, UserDataResponse } from "@/types/api/generated";
import type { AuthSessionPayload, Organization, User } from "@/store/slices/authSlice";

const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "user";
const MOCK_AUTH_KEY = "mockAuth";

function getBrowserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function decodeTokenPayload(token: string): { exp?: number } | null {
  try {
    const base64url = token.split(".")[1];
    if (!base64url) return null;

    const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + (4 - (base64.length % 4)) % 4,
      "="
    );

    return JSON.parse(atob(padded)) as { exp?: number };
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeTokenPayload(token);
  return payload?.exp ? Date.now() / 1000 > payload.exp : false;
}

export function getRoleFromUser(user: Pick<User, "role">): User["role"] {
  return normalizeUserRole(user.role);
}

export function buildOrganizationFromUser(user: User): Organization {
  return {
    id: user.organizationId,
    name: user.organizationName,
    type: user.organizationType,
    country: user.country,
    city: user.city,
    phoneNumber: user.organizationPhoneNumber,
    address: user.organizationAddress,
  };
}

export function normalizeUser(raw: UserDataResponse): User {
  const role = normalizeUserRole(raw.role ?? raw.roleName);

  return {
    id: raw.id ?? "",
    firstName: raw.firstName ?? "",
    lastName: raw.lastName ?? "",
    email: raw.email ?? "",
    role,
    status: raw.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    organizationId: raw.organizationId ?? "",
    organizationName: raw.organizationName ?? "",
    organizationType: raw.organizationType ?? "",
    country: raw.country ?? "",
    city: raw.city ?? "",
    organizationPhoneNumber: raw.organizationPhoneNumber ?? "",
    organizationAddress: raw.organizationAddress ?? "",
  };
}

export function normalizeAuthResponse(response: AuthResponse): AuthSessionPayload {
  if (!response.accessToken || !response.user) {
    throw new Error("Authentication response is missing session data.");
  }

  const user = normalizeUser(response.user);

  return {
    accessToken: response.accessToken,
    user,
    organization: buildOrganizationFromUser(user),
  };
}

function setCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
}

function clearCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

export function persistAuthSession(session: AuthSessionPayload): void {
  const storage = getBrowserStorage();

  storage?.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  storage?.setItem(USER_KEY, JSON.stringify(session.user));

  setCookie("accessToken", session.accessToken);
  setCookie("role", getRoleFromUser(session.user));
}

export function clearPersistedAuthSession(): void {
  const storage = getBrowserStorage();

  storage?.removeItem(MOCK_AUTH_KEY);
  storage?.removeItem(ACCESS_TOKEN_KEY);
  storage?.removeItem(USER_KEY);

  clearCookie("accessToken");
  clearCookie("role");
}

export function getPersistedAuthSession(): AuthSessionPayload | null {
  const storage = getBrowserStorage();
  const token = storage?.getItem(ACCESS_TOKEN_KEY);
  const userJson = storage?.getItem(USER_KEY);

  if (!token || !userJson) return null;

  if (isTokenExpired(token)) {
    clearPersistedAuthSession();
    return null;
  }

  try {
    const user = normalizeUser(JSON.parse(userJson) as UserDataResponse);

    return {
      accessToken: token,
      user,
      organization: buildOrganizationFromUser(user),
    };
  } catch {
    clearPersistedAuthSession();
    return null;
  }
}

