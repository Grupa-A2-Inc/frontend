import { baseApi } from "@/store/api/baseApi";
import type { AttemptReportDTO } from "@/types/api/generated";

export const testResultsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAttemptResult: builder.query<AttemptReportDTO, string>({
      query: (attemptId) => `/api/v1/attempts/${attemptId}/result`,
      providesTags: (_result, _error, attemptId) => [
        { type: "Analytics", id: `attempt:${attemptId}:result` },
      ],
    }),
  }),
});

export const {
  useGetAttemptResultQuery,
} = testResultsApi;
