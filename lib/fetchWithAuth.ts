export const SESSION_EXPIRED_EVENT = "auth:sessionExpired";

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

  if (response.status === 401 && typeof window !== "undefined") {
    if (!localStorage.getItem("mockAuth")) {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
  }

  return response;
}
