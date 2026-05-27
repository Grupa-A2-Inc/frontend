import {
  AdaptiveStartRequest,
  AdaptiveStartResponse,
  AdaptiveSubmitRequest,
  AdaptiveResult,
  ClientExercise,
  ExerciseType,
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

type AdaptiveExerciseResponse = Omit<ClientExercise, "type"> & { type?: string };

type AdaptiveStartApiResponse = Omit<AdaptiveStartResponse, "exercises"> & {
  exercises?: AdaptiveExerciseResponse[];
};

function normalizeExerciseType(type: string | undefined): ExerciseType {
  if (type === "MULTIPLE_CHOICE" || type === "MULTI_CHOICE") {
    return "MULTI_CHOICE";
  }
  if (type === "TRUE_FALSE") {
    return "TRUE_FALSE";
  }
  return "SINGLE_CHOICE";
}

export async function startAdaptiveSession(
  token: string,
  req: AdaptiveStartRequest
): Promise<AdaptiveStartResponse> {
  const response = await apiFetch<AdaptiveStartApiResponse>(ENDPOINTS.adaptive.start, token, {
    method: "POST",
    body: JSON.stringify(req),
  });

  return {
    ...response,
    exercises: (response.exercises ?? []).map((exercise) => ({
      ...exercise,
      type: normalizeExerciseType(exercise.type),
    })),
  };
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
