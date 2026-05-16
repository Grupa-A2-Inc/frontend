import { API_BASE } from "@/lib/config";
import { ENDPOINTS } from "@/lib/api-endpoints";

export const SESSION_EXPIRED_EVENT = "auth:sessionExpired";
export const ACCESS_TOKEN_REFRESHED_EVENT = "auth:accessTokenRefreshed";

type AuthFetchOptions = RequestInit & {
  skipAuthRefresh?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const value = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${name}=`))
    ?.split("=")[1];

  return value ? decodeURIComponent(value) : null;
}

export function getXsrfHeaders(): HeadersInit {
  const xsrfToken = getCookie("XSRF-TOKEN");
  return xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {};
}

function toHeaders(headers?: HeadersInit): Headers {
  return new Headers(headers ?? {});
}

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export function storeAccessToken(token: string): void {
  if (typeof window === "undefined") return;

  localStorage.setItem("accessToken", token);
  document.cookie = `accessToken=${token}; path=/;`;
  window.dispatchEvent(
    new CustomEvent(ACCESS_TOKEN_REFRESHED_EVENT, { detail: { accessToken: token } })
  );
}

export function clearStoredAccessToken(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem("accessToken");
  document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

function dispatchSessionExpired(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const headers = toHeaders({ Accept: "application/json" });
      Object.entries(getXsrfHeaders()).forEach(([key, value]) => {
        headers.set(key, value);
      });

      const response = await fetch(`${API_BASE}${ENDPOINTS.auth.refresh}`, {
        method: "POST",
        credentials: "include",
        headers,
      });

      if (!response.ok) {
        clearStoredAccessToken();
        dispatchSessionExpired();
        return null;
      }

      const data = (await response.json().catch(() => null)) as {
        accessToken?: string;
      } | null;

      if (!data?.accessToken) {
        clearStoredAccessToken();
        dispatchSessionExpired();
        return null;
      }

      storeAccessToken(data.accessToken);
      return data.accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

function resolveAccessToken(token?: string | null): string | null {
  return getStoredAccessToken() ?? token ?? null;
}

function buildAuthRequest(
  token: string | null,
  options: AuthFetchOptions,
): RequestInit {
  const requestOptions: AuthFetchOptions = { ...options };
  delete requestOptions.skipAuthRefresh;
  const headers = toHeaders(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return {
    ...requestOptions,
    credentials: options.credentials ?? "include",
    headers,
  };
}

export async function fetchWithAuth(
  url: string,
  token?: string | null,
  options: AuthFetchOptions = {}
): Promise<Response> {
  const initialToken = resolveAccessToken(token);
  const response = await fetch(url, buildAuthRequest(initialToken, options));

  if (response.status !== 401 || options.skipAuthRefresh) {
    return response;
  }

  const refreshedToken = await refreshAccessToken();
  if (!refreshedToken) return response;

  return fetch(url, buildAuthRequest(refreshedToken, options));
}
