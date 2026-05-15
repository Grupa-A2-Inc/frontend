import { baseApi } from "@/store/api/baseApi";
import type {
  CustomerSupportRequest,
  CustomerSupportResponse,
} from "@/types/domain/support";

export const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendSupportMessage: builder.mutation<CustomerSupportResponse, CustomerSupportRequest>({
      async queryFn(request) {
        try {
          const response = await fetch("/api/support-chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
          });

          if (!response.ok) {
            const data = await response.json().catch(() => null);
            return {
              error: {
                status: response.status,
                message:
                  typeof data?.message === "string"
                    ? data.message
                    : "Could not send message. Please try again.",
                details: data,
              },
            };
          }

          return { data: (await response.json()) as CustomerSupportResponse };
        } catch (error) {
          return {
            error: {
              status: "FETCH_ERROR",
              message: "Could not send message. Please try again.",
              details: error,
            },
          };
        }
      },
    }),
  }),
});

export const { useSendSupportMessageMutation } = supportApi;
