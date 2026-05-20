import { API_BASE } from "@/lib/config";
import { ENDPOINTS } from "@/lib/api-endpoints";

export const SESSION_EXPIRED_EVENT = "auth:sessionExpired";
export const ACCESS_TOKEN_REFRESHED_EVENT = "auth:accessTokenRefreshed";

type AuthFetchOptions = RequestInit & {
  skipAuthRefresh?: boolean;
};

type CsrfToken = {
  token: string;
  headerName: string;
};

const DEFAULT_XSRF_HEADER_NAME = "X-XSRF-TOKEN";
const XSRF_COOKIE_NAME = "XSRF-TOKEN";
const REFRESH_TOKEN_STORAGE_KEY = "refreshToken";

let refreshPromise: Promise<string | null> | null = null;
let csrfToken: CsrfToken | null = null;
let csrfPromise: Promise<CsrfToken | null> | null = null;

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
  const token = csrfToken?.token ?? getCookie(XSRF_COOKIE_NAME);
  const headerName = csrfToken?.headerName ?? DEFAULT_XSRF_HEADER_NAME;
  return token ? { [headerName]: token } : {};
}

function normalizeCsrfHeaderName(headerName?: string): string {
  const trimmedHeaderName = headerName?.trim();
  return trimmedHeaderName || DEFAULT_XSRF_HEADER_NAME;
}

function csrfHeadersFromToken(token: CsrfToken | null): Record<string, string> {
  if (!token?.token) return {};
  return { [token.headerName]: token.token };
}

async function requestCsrfToken(): Promise<CsrfToken | null> {
  try {
    const response = await fetch(`${API_BASE}${ENDPOINTS.auth.csrf}`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data = (await response.json().catch(() => null)) as {
      csrfToken?: string;
      headerName?: string;
    } | null;

    if (!data?.csrfToken) return null;

    csrfToken = {
      token: data.csrfToken,
      headerName: normalizeCsrfHeaderName(data.headerName),
    };

    return csrfToken;
  } catch {
    return null;
  }
}

export function clearStoredCsrfToken(): void {
  csrfToken = null;
  csrfPromise = null;
}

export async function refreshCsrfToken(): Promise<CsrfToken | null> {
  clearStoredCsrfToken();
  return getCsrfToken();
}

export async function getCsrfToken(): Promise<CsrfToken | null> {
  if (typeof window === "undefined") return null;
  if (csrfToken) return csrfToken;

  if (!csrfPromise) {
    csrfPromise = requestCsrfToken().finally(() => {
      csrfPromise = null;
    });
  }

  return csrfPromise;
}

export async function getXsrfHeadersAsync(options: { forceRefresh?: boolean } = {}): Promise<HeadersInit> {
  if (options.forceRefresh) {
    const headers = csrfHeadersFromToken(await refreshCsrfToken());
    return Object.keys(headers).length > 0 ? headers : getXsrfHeaders();
  }

  const token = await getCsrfToken();
  if (token) return csrfHeadersFromToken(token);

  return getXsrfHeaders();
}

function toHeaders(headers?: HeadersInit): Headers {
  return new Headers(headers ?? {});
}

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function storeRefreshToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token);
}

export function clearStoredRefreshToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
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
  clearStoredRefreshToken();
  clearStoredCsrfToken();
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
  if (status === 401 || status === 403) {
    return handleRefreshFailure(tokenThatTriggeredRefresh);
  }

  return null;
}

export async function refreshAccessToken(tokenThatTriggeredRefresh: string | null): Promise<string | null> {
  if (typeof window === "undefined") return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        let response = await refreshAccessTokenRequest(false);

        if (response.status === 403) {
          response = await refreshAccessTokenRequest(true);
        }

        if (!response.ok) {
          return handleRefreshHttpError(response.status, tokenThatTriggeredRefresh);
        }

        const data = (await response.json().catch(() => null)) as {
          accessToken?: string;
          refreshToken?: string;
          refresh_token?: string;
        } | null;

        if (!data?.accessToken) {
          return handleRefreshFailure(tokenThatTriggeredRefresh);
        }

        storeAccessToken(data.accessToken);
        const rotatedRefreshToken = data.refreshToken ?? data.refresh_token;
        if (rotatedRefreshToken) {
          storeRefreshToken(rotatedRefreshToken);
        }
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

async function refreshAccessTokenRequest(forceCsrfRefresh: boolean): Promise<Response> {
  const headers = toHeaders({ Accept: "application/json" });
  const refreshToken = getStoredRefreshToken();

  Object.entries(await getXsrfHeadersAsync({ forceRefresh: forceCsrfRefresh })).forEach(
    ([key, value]) => {
      headers.set(key, value);
    }
  );

  const body = refreshToken ? JSON.stringify({ refreshToken }) : undefined;
  if (body) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_BASE}${ENDPOINTS.auth.refresh}`, {
    method: "POST",
    credentials: "include",
    headers,
    body,
    cache: "no-store",
  });
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
