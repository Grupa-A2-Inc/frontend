import { clearPersistedAuthSession, normalizeAuthResponse, persistAuthSession } from "@/lib/auth/session";
import { getApiErrorMessage } from "@/lib/api/errors";
import { baseApi } from "@/store/api/baseApi";
import { clearSession, setSession } from "@/store/slices/authSlice";
import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  SetPasswordRequest,
} from "@/types/api/generated";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: "/api/v1/auth/login",
        method: "POST",
        body,
      }),
      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        const session = normalizeAuthResponse(data);

        persistAuthSession(session);
        dispatch(setSession(session));
      },
      invalidatesTags: ["Auth"],
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({
        url: "/api/v1/auth/register",
        method: "POST",
        body,
      }),
      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        const session = normalizeAuthResponse(data);

        persistAuthSession(session);
        dispatch(setSession(session));
      },
      invalidatesTags: ["Auth"],
    }),
    logout: builder.mutation<void, string | void>({
      query: (token) => ({
        url: "/api/v1/auth/logout",
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }),
      async onQueryStarted(_token, { dispatch, queryFulfilled }) {
        clearPersistedAuthSession();
        dispatch(clearSession());

        try {
          await queryFulfilled;
        } catch {
          // Logout remains best-effort; local session has already been cleared.
        } finally {
          dispatch(baseApi.util.resetApiState());
        }
      },
    }),
    setPassword: builder.mutation<unknown, SetPasswordRequest>({
      query: (body) => ({
        url: "/api/v1/auth/set-password",
        method: "POST",
        body,
      }),
    }),
    requestPasswordReset: builder.mutation<unknown, ForgotPasswordRequest>({
      query: (body) => ({
        url: "/api/v1/auth/password-reset/request",
        method: "POST",
        body,
      }),
    }),
    confirmPasswordReset: builder.mutation<unknown, ResetPasswordRequest>({
      query: (body) => ({
        url: "/api/v1/auth/password-reset/confirm",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useSetPasswordMutation,
  useRequestPasswordResetMutation,
  useConfirmPasswordResetMutation,
} = authApi;

export function getAuthMutationErrorMessage(error: unknown): string {
  return getApiErrorMessage(error);
}
