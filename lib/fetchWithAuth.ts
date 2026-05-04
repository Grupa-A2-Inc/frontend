export const SESSION_EXPIRED_EVENT = "auth:sessionExpired";

function isTokenExpired(token: string): boolean {
  try {
    const base64url = token.split(".")[1];
    const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    const payload = JSON.parse(atob(padded));
    return payload.exp ? Date.now() / 1000 > payload.exp : false;
  } catch {
    return false;
  }
}

export async function fetchWithAuth(
  url: string,
  token: string,
  options: RequestInit = {}
): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401 && typeof window !== "undefined" && isTokenExpired(token)) {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }

  return response;
}
