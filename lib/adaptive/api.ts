import {
  AdaptiveJobResponse,
  AdaptiveJobStatusResponse,
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

type AdaptiveJobStatusApiResponse = Omit<AdaptiveJobStatusResponse, "session"> & {
  session?: AdaptiveStartApiResponse | null;
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

function normalizeAdaptiveStartResponse(
  response: AdaptiveStartApiResponse,
): AdaptiveStartResponse {
  return {
    ...response,
    exercises: (response.exercises ?? []).map((exercise) => ({
      ...exercise,
      type: normalizeExerciseType(exercise.type),
    })),
  };
}

function normalizeAdaptiveJobStatusResponse(
  response: AdaptiveJobStatusApiResponse,
): AdaptiveJobStatusResponse {
  return {
    ...response,
    session: response.session ? normalizeAdaptiveStartResponse(response.session) : null,
  };
}

async function pollAdaptiveJobStatus(
  token: string,
  jobId: string,
  intervalMs = 4000,
): Promise<AdaptiveJobStatusResponse> {
  while (true) {
    const response = await apiFetch<AdaptiveJobStatusApiResponse>(
      ENDPOINTS.adaptive.jobStatus(jobId),
      token,
    );
    const normalized = normalizeAdaptiveJobStatusResponse(response);

    if (normalized.status === "DONE" || normalized.status === "FAILED") {
      return normalized;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

export async function startAdaptiveSession(
  token: string,
  req: AdaptiveStartRequest
): Promise<AdaptiveStartResponse> {
  const job = await apiFetch<AdaptiveJobResponse>(ENDPOINTS.adaptive.jobs, token, {
    method: "POST",
    body: JSON.stringify(req),
  });

  if (job.status === "FAILED") {
    throw new Error("Adaptive session generation failed. Please try again.");
  }

  const status = await pollAdaptiveJobStatus(token, job.jobId);
  if (status.status === "FAILED") {
    throw new Error(status.error ?? "Adaptive session generation failed. Please try again.");
  }

  if (!status.session) {
    throw new Error("Adaptive session generation finished without session data.");
  }

  return status.session;
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
