import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/fetchWithAuth", () => ({
  fetchWithAuth: vi.fn(),
}));

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { fetchTeacherCatalog } from "@/store/slices/analyticsSlice";

const mockFetch = vi.mocked(fetchWithAuth);

function response(data: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => data,
  } as Response;
}

function runFetchTeacherCatalog() {
  return fetchTeacherCatalog({ courseId: "course-1", page: 0, size: 10 })(
    vi.fn(),
    () => ({ auth: { accessToken: "token-1" } }),
    undefined,
  );
}

describe("fetchTeacherCatalog", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("uses enrolled student progress as the gradebook source of truth", async () => {
    mockFetch
      .mockResolvedValueOnce(
        response({
          content: [
            {
              studentId: "student-1",
              enrolledAt: "2026-01-01T00:00:00Z",
              progressPercent: 45,
            },
            {
              studentId: "student-2",
              enrolledAt: "2026-01-02T00:00:00Z",
              progressPercent: 0,
            },
          ],
          totalPages: 1,
          totalElements: 2,
          number: 0,
          size: 10,
          numberOfElements: 2,
          first: true,
          last: true,
          empty: false,
        }),
      )
      .mockResolvedValueOnce(
        response({
          content: [
            {
              studentId: "student-1",
              averageScore: 85,
              minScore: 70,
              maxScore: 95,
              testCount: 2,
              passedTests: 2,
              failedTests: 0,
            },
          ],
          totalPages: 1,
          last: true,
        }),
      );

    const result = await runFetchTeacherCatalog();

    expect(fetchTeacherCatalog.fulfilled.match(result)).toBe(true);
    if (!fetchTeacherCatalog.fulfilled.match(result)) return;

    expect(result.payload.totalElements).toBe(2);
    expect(result.payload.content).toEqual([
      expect.objectContaining({
        studentId: "student-1",
        progressPercent: 45,
        averageScore: 85,
        testCount: 2,
      }),
      expect.objectContaining({
        studentId: "student-2",
        progressPercent: 0,
        averageScore: 0,
        testCount: 0,
      }),
    ]);
  });
});
