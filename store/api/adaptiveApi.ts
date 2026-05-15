import { baseApi } from "@/store/api/baseApi";
import type {
  AdaptiveStartRequest,
  AdaptiveStartResponse,
  AdaptiveSubmitRequest,
  AdaptiveSubmitResponse,
} from "@/types/domain/adaptive";

type SubmitAdaptiveSessionArgs = {
  sessionId: string;
  data: AdaptiveSubmitRequest;
};

export const adaptiveApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    startAdaptiveSession: builder.mutation<AdaptiveStartResponse, AdaptiveStartRequest>({
      query: (body) => ({
        url: "/api/v1/adaptive/start",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "AdaptiveSession", id: "CURRENT" }],
    }),
    submitAdaptiveSession: builder.mutation<AdaptiveSubmitResponse, SubmitAdaptiveSessionArgs>({
      query: ({ sessionId, data }) => ({
        url: `/api/v1/adaptive/sessions/${sessionId}/submit`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { sessionId }) => [
        { type: "AdaptiveSession", id: sessionId },
        { type: "AdaptiveSession", id: "CURRENT" },
      ],
    }),
  }),
});

export const {
  useStartAdaptiveSessionMutation,
  useSubmitAdaptiveSessionMutation,
} = adaptiveApi;
