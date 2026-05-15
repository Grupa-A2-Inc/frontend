import { baseApi } from "@/store/api/baseApi";
import type {
  CheckoutSession,
  CreateCheckoutSessionPayload,
  OrganizationSubscription,
  OrganizationSubscriptionStatus,
  SubscriptionPlan,
} from "@/types/domain/subscriptions";

type OrganizationSubscriptionArgs = {
  organizationId: string;
};

type CreateCheckoutArgs = OrganizationSubscriptionArgs & {
  data: CreateCheckoutSessionPayload;
};

type ChangePlanArgs = OrganizationSubscriptionArgs & {
  planId: string;
};

export const subscriptionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptionPlans: builder.query<SubscriptionPlan[], void>({
      query: () => "/api/v1/subscription-plans",
      transformResponse: (response: SubscriptionPlan[] | unknown) =>
        Array.isArray(response) ? response.filter(isSubscriptionPlan) : [],
      providesTags: [{ type: "Subscription", id: "PLANS" }],
    }),
    getCurrentOrganizationSubscription: builder.query<
      OrganizationSubscriptionStatus,
      string
    >({
      query: (organizationId) =>
        `/api/v1/organizations/${organizationId}/subscription`,
      transformResponse: (response: OrganizationSubscriptionStatus) => ({
        ...response,
        organizationId: response.organizationId ?? "",
        status: response.status ?? "EXPIRED",
        currentPeriodStart: response.currentPeriodStart ?? "",
        currentPeriodEnd: response.currentPeriodEnd ?? "",
        plan: response.plan,
      }),
      providesTags: (_result, _error, organizationId) => [
        { type: "Subscription", id: organizationId },
      ],
    }),
    createSubscriptionCheckoutSession: builder.mutation<
      CheckoutSession,
      CreateCheckoutArgs
    >({
      query: ({ organizationId, data }) => ({
        url: `/api/v1/organizations/${organizationId}/subscription/checkout`,
        method: "POST",
        body: data,
      }),
    }),
    changeOrganizationSubscriptionPlan: builder.mutation<
      OrganizationSubscription,
      ChangePlanArgs
    >({
      query: ({ organizationId, planId }) => ({
        url: `/api/v1/organizations/${organizationId}/subscription`,
        method: "PATCH",
        body: { planId },
      }),
      invalidatesTags: (_result, _error, { organizationId }) => [
        { type: "Subscription", id: organizationId },
      ],
    }),
  }),
});

function isSubscriptionPlan(value: unknown): value is SubscriptionPlan {
  if (!value || typeof value !== "object") return false;

  const plan = value as Partial<SubscriptionPlan>;

  return (
    typeof plan.id === "string" &&
    typeof plan.code === "string" &&
    typeof plan.displayName === "string" &&
    typeof plan.maxUsers === "number" &&
    typeof plan.maxClassrooms === "number" &&
    typeof plan.maxCourses === "number" &&
    typeof plan.hasPremiumFeatures === "boolean" &&
    typeof plan.priceMonthly === "number" &&
    typeof plan.currency === "string"
  );
}

export const {
  useGetSubscriptionPlansQuery,
  useGetCurrentOrganizationSubscriptionQuery,
  useCreateSubscriptionCheckoutSessionMutation,
  useChangeOrganizationSubscriptionPlanMutation,
} = subscriptionsApi;
