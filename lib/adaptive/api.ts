import {
  AdaptiveStartRequest,
  AdaptiveStartResponse,
  AdaptiveSubmitRequest,
  AdaptiveResult,
} from "./types";
import { API_BASE } from "@/lib/config";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

async function apiFetch<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetchWithAuth(`${API_BASE}${path}`, token, {
    ...options,
    headers,
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
  return apiFetch<AdaptiveStartResponse>(ENDPOINTS.adaptive.start, token, {
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
    ENDPOINTS.adaptive.submitSession(sessionId),
    token,
    {
      method: "POST",
      body: JSON.stringify(req),
    }
  );
}
