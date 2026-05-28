import { beforeEach, describe, expect, it, vi } from "vitest";
import { startAdaptiveSession, submitAdaptiveSession } from "@/lib/adaptive/api";
import { API_BASE } from "@/lib/config";

vi.mock("@/lib/fetchWithAuth", () => ({ fetchWithAuth: vi.fn() }));
import { fetchWithAuth } from "@/lib/fetchWithAuth";

const mockFetch = vi.mocked(fetchWithAuth);

function okRes(body: unknown, status = 200) {
  return {
    ok: true,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(""),
  } as unknown as Response;
}

function errRes(status: number, text = "") {
  return {
    ok: false,
    status,
    statusText: "Error",
    text: () => Promise.resolve(text),
    json: () => Promise.resolve({}),
  } as unknown as Response;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("startAdaptiveSession", () => {
  const request = { subjectId: 1, topicId: 10, count: 5 };

  it("creates an adaptive job and returns the finished session", async () => {
    mockFetch
      .mockResolvedValueOnce(okRes({ jobId: "job-1", status: "PENDING" }, 202))
      .mockResolvedValueOnce(
        okRes({
          jobId: "job-1",
          status: "DONE",
          error: null,
          session: {
            sessionId: "session-1",
            expiresAt: "2026-05-20T10:45:00",
            exercises: [
              {
                exerciseId: "ex-1",
                text: "Question",
                type: "MULTIPLE_CHOICE",
                answers: ["A", "B"],
              },
            ],
          },
        }),
      );

    const result = await startAdaptiveSession("tok", request);

    expect(result.sessionId).toBe("session-1");
    expect(result.exercises[0].type).toBe("MULTI_CHOICE");
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      `${API_BASE}/api/v1/adaptive/jobs`,
      "tok",
      expect.objectContaining({ method: "POST" }),
    );
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      `${API_BASE}/api/v1/adaptive/jobs/job-1`,
      "tok",
      expect.any(Object),
    );
  });

  it("polls multiple times before DONE", async () => {
    vi.useFakeTimers();
    mockFetch
      .mockResolvedValueOnce(okRes({ jobId: "job-1", status: "PENDING" }, 202))
      .mockResolvedValueOnce(okRes({ jobId: "job-1", status: "RUNNING", error: null, session: null }))
      .mockResolvedValueOnce(
        okRes({
          jobId: "job-1",
          status: "DONE",
          error: null,
          session: {
            sessionId: "session-1",
            expiresAt: "2026-05-20T10:45:00",
            exercises: [],
          },
        }),
      );

    const resultPromise = startAdaptiveSession("tok", request);
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result.sessionId).toBe("session-1");
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("throws when job creation fails immediately", async () => {
    mockFetch.mockResolvedValueOnce(okRes({ jobId: "job-1", status: "FAILED" }, 202));

    await expect(startAdaptiveSession("tok", request)).rejects.toThrow(
      "Adaptive session generation failed",
    );
  });

  it("throws when polling returns FAILED with backend error", async () => {
    mockFetch
      .mockResolvedValueOnce(okRes({ jobId: "job-1", status: "PENDING" }, 202))
      .mockResolvedValueOnce(
        okRes({
          jobId: "job-1",
          status: "FAILED",
          error: "Adaptive AI returned an invalid response.",
          session: null,
        }),
      );

    await expect(startAdaptiveSession("tok", request)).rejects.toThrow(
      "Adaptive AI returned an invalid response.",
    );
  });

  it("throws when polling completes without session data", async () => {
    mockFetch
      .mockResolvedValueOnce(okRes({ jobId: "job-1", status: "PENDING" }, 202))
      .mockResolvedValueOnce(okRes({ jobId: "job-1", status: "DONE", error: null, session: null }));

    await expect(startAdaptiveSession("tok", request)).rejects.toThrow(
      "Adaptive session generation finished without session data.",
    );
  });

  it("throws on HTTP error", async () => {
    mockFetch.mockResolvedValueOnce(errRes(500, "Server Error"));
    await expect(startAdaptiveSession("tok", request)).rejects.toThrow("HTTP 500");
  });
});

describe("submitAdaptiveSession", () => {
  it("returns result on success", async () => {
    const raw = { totalScore: 90, feedbackSent: true, clientResults: [] };
    mockFetch.mockResolvedValueOnce(okRes(raw));
    const result = await submitAdaptiveSession("tok", "s1", { answers: [] });
    expect(result.totalScore).toBe(90);
  });

  it("throws on HTTP error", async () => {
    mockFetch.mockResolvedValueOnce(errRes(400, "Bad Request"));
    await expect(submitAdaptiveSession("tok", "s1", { answers: [] })).rejects.toThrow(
      "HTTP 400",
    );
  });
});
