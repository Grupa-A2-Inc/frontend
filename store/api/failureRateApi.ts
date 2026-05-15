import { baseApi } from "@/store/api/baseApi";
import type {
  FailureRate,
  FailureRateAlert,
  FailureRateAlertPayload,
  FailureRateChart,
} from "@/types/domain/analytics";

type LessonFailureRateArgs = {
  lessonId: string;
};

type TestAlertArgs = {
  testId: string;
  data: FailureRateAlertPayload;
};

export const failureRateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCourseFailureRateChart: builder.query<FailureRateChart, string>({
      query: (courseId) => `/api/v1/courses/${courseId}/analytics/chart-data`,
      providesTags: (_result, _error, courseId) => [
        { type: "Analytics", id: `${courseId}:failure-chart` },
      ],
    }),
    getLessonFailureRate: builder.query<FailureRate, LessonFailureRateArgs>({
      query: ({ lessonId }) => `/api/v1/lessons/${lessonId}/analytics/failure-rate`,
      providesTags: (_result, _error, { lessonId }) => [
        { type: "Analytics", id: `${lessonId}:lesson-failure-rate` },
      ],
    }),
    getTestFailureRate: builder.query<FailureRate, string>({
      query: (testId) => `/api/v1/tests/${testId}/analytics/failure-rate`,
      providesTags: (_result, _error, testId) => [
        { type: "Analytics", id: `${testId}:test-failure-rate` },
      ],
    }),
    upsertTestFailureRateAlert: builder.mutation<FailureRateAlert, TestAlertArgs>({
      query: ({ testId, data }) => ({
        url: `/api/v1/tests/${testId}/analytics/alerts`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { testId }) => [
        { type: "Analytics", id: `${testId}:test-failure-rate` },
      ],
    }),
  }),
});

export const {
  useGetCourseFailureRateChartQuery,
  useGetLessonFailureRateQuery,
  useGetTestFailureRateQuery,
  useUpsertTestFailureRateAlertMutation,
} = failureRateApi;
