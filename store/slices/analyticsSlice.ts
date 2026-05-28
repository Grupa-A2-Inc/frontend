import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { API_BASE } from "@/lib/config";
import { StudentAverage, StudentCourseStats, TeacherCatalogResponse } from "@/lib/analytics/types";
import type { RootState } from "@/store";

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

type PageResponse<T> =
  | T[]
  | {
      content?: T[];
      totalPages?: number;
      totalElements?: number;
      number?: number;
      numberOfElements?: number;
      size?: number;
      first?: boolean;
      last?: boolean;
      empty?: boolean;
    };

type StudentProgressDto = {
  studentId: string;
  enrolledAt?: string;
  progressPercent?: number;
  completedAt?: string;
};

const FALLBACK_PAGE_SIZE = 100;
const MAX_ANALYTICS_PAGES = 1000;

async function parseError(response: Response, fallback: string): Promise<string> {
  const data = await response.json().catch(() => null);
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.error === "string") return data.error;
  return `${fallback} (${response.status})`;
}

function getPageContent<T>(data: PageResponse<T>): T[] {
  return Array.isArray(data) ? data : (data.content ?? []);
}

function normalizeStudentAverage(data: Partial<StudentAverage> & { studentId: string }): StudentAverage {
  return {
    studentId: data.studentId,
    averageScore: data.averageScore ?? 0,
    minScore: data.minScore ?? 0,
    maxScore: data.maxScore ?? 0,
    testCount: data.testCount ?? 0,
    passedTests: data.passedTests ?? 0,
    failedTests: data.failedTests ?? 0,
    lastAttemptAt: data.lastAttemptAt,
    enrolledAt: data.enrolledAt,
    progressPercent: data.progressPercent ?? 0,
  };
}

async function requestPage<T>(
  endpoint: string,
  token: string | null | undefined,
  page: number,
  size: number,
  fallbackError: string,
): Promise<PageResponse<T>> {
  const response = await fetchWithAuth(
    `${API_BASE}${endpoint}?page=${page}&size=${size}`,
    token,
  );

  if (!response.ok) {
    throw new Error(await parseError(response, fallbackError));
  }

  return (await response.json()) as PageResponse<T>;
}

async function requestAllPages<T>(
  endpoint: string,
  token: string | null | undefined,
  fallbackError: string,
): Promise<T[]> {
  const itemsByKey = new Map<string, T>();

  for (let page = 0; page < MAX_ANALYTICS_PAGES; page += 1) {
    const data = await requestPage<T>(
      endpoint,
      token,
      page,
      FALLBACK_PAGE_SIZE,
      fallbackError,
    );
    const items = getPageContent(data);
    const previousSize = itemsByKey.size;

    items.forEach((item, index) => {
      const id = typeof item === "object" && item !== null
        ? String((item as Record<string, unknown>).studentId ?? index)
        : String(index);
      itemsByKey.set(id, item);
    });

    if (Array.isArray(data)) break;
    if (data.last ?? page + 1 >= (data.totalPages ?? 1)) break;
    if (page > 0 && itemsByKey.size === previousSize) break;
  }

  return [...itemsByKey.values()];
}

async function requestTeacherCatalog(
  courseId: string,
  token: string | null | undefined,
  page: number,
  size: number,
): Promise<TeacherCatalogResponse> {
  const progressData = await requestPage<StudentProgressDto>(
    ENDPOINTS.courses.studentsProgress(courseId),
    token,
    page,
    size,
    "Eroare la preluarea progresului studentilor",
  );

  const averages = await requestAllPages<StudentAverage>(
    ENDPOINTS.courses.analyticsStudentAverages(courseId),
    token,
    "Eroare la preluarea catalogului",
  );
  const averagesByStudent = new Map(
    averages.map((average) => [average.studentId, normalizeStudentAverage(average)]),
  );
  const progress = getPageContent(progressData);
  const content = progress.map((student) => ({
    ...normalizeStudentAverage(
      averagesByStudent.get(student.studentId) ?? { studentId: student.studentId },
    ),
    enrolledAt: student.enrolledAt,
    progressPercent: student.progressPercent ?? 0,
  }));

  if (content.length === 0 && averages.length > 0) {
    const start = page * size;
    const fallbackContent = averages
      .slice(start, start + size)
      .map((average) => normalizeStudentAverage(average));
    const totalPages = averages.length > 0 ? Math.ceil(averages.length / size) : 0;

    return {
      content: fallbackContent,
      totalPages,
      totalElements: averages.length,
      number: page,
      numberOfElements: fallbackContent.length,
      size,
      first: page === 0,
      last: page + 1 >= totalPages,
      empty: fallbackContent.length === 0,
    };
  }

  if (Array.isArray(progressData)) {
    return {
      content,
      totalPages: content.length > 0 ? 1 : 0,
      totalElements: content.length,
      number: 0,
      numberOfElements: content.length,
      size: content.length || size,
      first: true,
      last: true,
      empty: content.length === 0,
    };
  }

  return {
    content,
    totalPages: progressData.totalPages ?? 0,
    totalElements: progressData.totalElements ?? content.length,
    number: progressData.number ?? page,
    numberOfElements: progressData.numberOfElements ?? content.length,
    size: progressData.size ?? size,
    first: progressData.first ?? page === 0,
    last: progressData.last ?? page + 1 >= (progressData.totalPages ?? 1),
    empty: progressData.empty ?? content.length === 0,
  };
}

export const fetchStudentCourseStats = createAsyncThunk(
  "analytics/fetchStudentCourseStats",
  async (courseId: string, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).auth.accessToken;
      const response = await fetchWithAuth(`${API_BASE}${ENDPOINTS.students.myCourseStats(courseId)}`, token);
      
      if (!response.ok) throw new Error("Eroare la preluarea datelor studentului");
      return await response.json() as StudentCourseStats;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Eroare la preluarea datelor studentului"));
    }
  }
);


export const fetchTeacherCatalog = createAsyncThunk(
  "analytics/fetchTeacherCatalog",
  async (
    { courseId, page = 0, size = 10 }: { courseId: string; page?: number; size?: number },
    { getState, rejectWithValue },
  ) => {
    try {
      const token = (getState() as RootState).auth.accessToken;
      return await requestTeacherCatalog(courseId, token, page, size);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, "Eroare la preluarea catalogului"));
    }
  }
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState: {
    studentStats: null as StudentCourseStats | null,
    teacherCatalog: null as TeacherCatalogResponse | null,
    loading: false,
    error: null as string | null,
  },
  reducers: {
    
    clearAnalyticsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      
      .addCase(fetchStudentCourseStats.pending, (state) => { 
        state.loading = true; 
        state.error = null;
      })
      .addCase(fetchStudentCourseStats.fulfilled, (state, action) => {
        state.loading = false;
        state.studentStats = action.payload;
      })
      .addCase(fetchStudentCourseStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchTeacherCatalog.pending, (state) => { 
        state.loading = true; 
        state.error = null;
      })
      .addCase(fetchTeacherCatalog.fulfilled, (state, action) => {
        state.loading = false;
        state.teacherCatalog = action.payload;
      })
      .addCase(fetchTeacherCatalog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAnalyticsError } = analyticsSlice.actions;
export default analyticsSlice.reducer;
