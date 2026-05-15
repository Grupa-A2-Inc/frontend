import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { config } from "@/lib/config";
import { SESSION_EXPIRED_EVENT } from "@/lib/auth/events";
import { mapFetchBaseQueryError } from "@/lib/api/errors";
import type { ApiError } from "@/types/api/errors";

type AuthAwareState = {
  auth?: {
    accessToken?: string | null;
  };
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: config.apiBaseUrl,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    headers.set("Accept", "application/json");

    const token = (getState() as AuthAwareState).auth?.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, ApiError> =
  async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);

    if (result.error) {
      if (
        result.error.status === 401 &&
        typeof window !== "undefined"
      ) {
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      }

      return {
        error: mapFetchBaseQueryError(result.error as FetchBaseQueryError),
      };
    }

    return { data: result.data };
  };

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    "Auth",
    "Organization",
    "User",
    "Classroom",
    "Course",
    "Chapter",
    "Lesson",
    "LessonResource",
    "Test",
    "Question",
    "Attempt",
    "Progress",
    "Analytics",
    "AdaptiveSession",
    "Subscription",
    "Parent",
    "Certificate",
  ],
  endpoints: () => ({}),
});
