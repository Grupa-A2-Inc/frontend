import { baseApi } from "@/store/api/baseApi";
import type {
  AttemptStatus,
  ClassAverage,
  MyCourseSummary,
  MyTestStats,
  StudentAverage,
} from "@/types/domain/analytics";
import type { PageStudentAverageDto, StudentAverageDto } from "@/types/api/generated";

type PageArgs = {
  page?: number;
  size?: number;
};

type CourseAnalyticsArgs = PageArgs & {
  courseId: string;
};

function normalizeStudentAverage(average: StudentAverageDto): StudentAverage {
  return {
    studentId: average.studentId ?? "",
    averageScore: average.averageScore ?? 0,
    minScore: average.minScore ?? 0,
    maxScore: average.maxScore ?? 0,
    testCount: average.testCount ?? 0,
    passedTests: average.passedTests ?? 0,
    failedTests: average.failedTests ?? 0,
    lastAttemptAt: average.lastAttemptAt,
  };
}

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCourseStudentAverages: builder.query<StudentAverage[], CourseAnalyticsArgs>({
      query: ({ courseId, page = 0, size = 100 }) => ({
        url: `/api/v1/courses/${courseId}/analytics/student-averages`,
        params: { page, size },
      }),
      transformResponse: (response: PageStudentAverageDto | StudentAverageDto[]) =>
        (Array.isArray(response) ? response : response.content ?? [])
          .map(normalizeStudentAverage)
          .filter((average) => average.studentId),
      providesTags: (_result, _error, { courseId }) => [
        { type: "Analytics", id: `${courseId}:student-averages` },
      ],
    }),
    getMyCourseSummary: builder.query<MyCourseSummary, string>({
      query: (courseId) => `/api/v1/students/me/courses/${courseId}/stats`,
      providesTags: (_result, _error, courseId) => [
        { type: "Analytics", id: `${courseId}:my-summary` },
      ],
    }),
    getMyTestStats: builder.query<MyTestStats, string>({
      query: (testId) => `/api/v1/students/me/tests/${testId}/stats`,
      providesTags: (_result, _error, testId) => [
        { type: "Analytics", id: `${testId}:my-test-stats` },
      ],
    }),
    getMyTestAttempts: builder.query<AttemptStatus[], string>({
      query: (testId) => `/api/v1/tests/${testId}/my-attempts`,
      providesTags: (_result, _error, testId) => [
        { type: "Attempt", id: `${testId}:MY_ATTEMPTS` },
      ],
    }),
    getMyBestAttempt: builder.query<AttemptStatus, string>({
      query: (testId) => `/api/v1/tests/${testId}/my-best`,
      providesTags: (_result, _error, testId) => [
        { type: "Attempt", id: `${testId}:MY_BEST` },
      ],
    }),
    getTestClassAverage: builder.query<ClassAverage, string>({
      query: (testId) => `/api/v1/tests/${testId}/analytics/class-average`,
      providesTags: (_result, _error, testId) => [
        { type: "Analytics", id: `${testId}:class-average` },
      ],
    }),
  }),
});

export const {
  useGetCourseStudentAveragesQuery,
  useGetMyCourseSummaryQuery,
  useGetMyTestStatsQuery,
  useGetMyTestAttemptsQuery,
  useGetMyBestAttemptQuery,
  useGetTestClassAverageQuery,
} = analyticsApi;
