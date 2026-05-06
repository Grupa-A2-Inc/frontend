import {
  AdaptiveStartRequest,
  AdaptiveStartResponse,
  AdaptiveSubmitRequest,
  AdaptiveResult,
} from "./types";

const API_BASE = "https://api.adaptiveelearning.online";

async function apiFetch<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function startAdaptiveSession(
  token: string,
  req: AdaptiveStartRequest
): Promise<AdaptiveStartResponse> {
  return apiFetch<AdaptiveStartResponse>("/api/v1/adaptive/start", token, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function submitAdaptiveSession(
  token: string,
  sessionId: string,
  req: AdaptiveSubmitRequest
): Promise<AdaptiveResult> {
  return apiFetch<AdaptiveResult>(
    `/api/v1/adaptive/sessions/${sessionId}/submit`,
    token,
    {
      method: "POST",
      body: JSON.stringify(req),
    }
  );
}
