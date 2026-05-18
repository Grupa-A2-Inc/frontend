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

  const cookie = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${name}=`));
  if (!cookie) return null;

  const value = cookie.slice(name.length + 1);
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

function handleRefreshFailure(tokenThatTriggeredRefresh: string | null): null {
  const currentToken = getStoredAccessToken();
  if (tokenThatTriggeredRefresh && currentToken && currentToken !== tokenThatTriggeredRefresh) {
    return null;
  }

  clearStoredAccessToken();
  dispatchSessionExpired();
  return null;
}

function handleRefreshHttpError(status: number, tokenThatTriggeredRefresh: string | null): null {
  if (status === 401) {
    return handleRefreshFailure(tokenThatTriggeredRefresh);
  }

  return null;
}

async function refreshAccessToken(tokenThatTriggeredRefresh: string | null): Promise<string | null> {
  if (typeof window === "undefined") return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const headers = toHeaders({ Accept: "application/json" });
        Object.entries(getXsrfHeaders()).forEach(([key, value]) => {
          headers.set(key, value);
        });

        const response = await fetch(`${API_BASE}${ENDPOINTS.auth.refresh}`, {
          method: "POST",
          credentials: "include",
          headers,
          cache: "no-store",
        });

        if (!response.ok) {
          return handleRefreshHttpError(response.status, tokenThatTriggeredRefresh);
        }

        const data = (await response.json().catch(() => null)) as {
          accessToken?: string;
        } | null;

        if (!data?.accessToken) {
          return handleRefreshFailure(tokenThatTriggeredRefresh);
        }

        storeAccessToken(data.accessToken);
        return data.accessToken;
      } catch {
        return null;
      }
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

  const refreshedToken = await refreshAccessToken(initialToken);
  if (!refreshedToken) return response;

  return fetch(url, buildAuthRequest(refreshedToken, options));
}
