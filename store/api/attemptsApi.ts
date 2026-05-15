import { baseApi } from "@/store/api/baseApi";
import type {
  StartAttemptResponseDto,
  SubmitRequestDto,
  TestResultDto,
} from "@/types/api/generated";

type SubmitAttemptArgs = {
  attemptId: string;
  data: SubmitRequestDto;
};

export const attemptsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    startAttempt: builder.mutation<StartAttemptResponseDto, string>({
      query: (testId) => ({
        url: `/api/v1/tests/${testId}/start`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, testId) => [
        { type: "Attempt", id: `${testId}:MY_ATTEMPTS` },
      ],
    }),
    submitAttempt: builder.mutation<TestResultDto, SubmitAttemptArgs>({
      query: ({ attemptId, data }) => ({
        url: `/api/v1/attempts/${attemptId}/submit`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { attemptId }) => [
        { type: "Attempt", id: attemptId },
        { type: "Analytics", id: `attempt:${attemptId}:result` },
      ],
    }),
  }),
});

export const {
  useStartAttemptMutation,
  useSubmitAttemptMutation,
} = attemptsApi;
