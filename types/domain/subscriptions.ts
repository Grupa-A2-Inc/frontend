import type {
  CheckoutSessionResponse,
  CreateCheckoutSessionRequest,
  OrganizationSubscriptionResponse,
  OrganizationSubscriptionStatusResponse,
  SubscriptionPlanResponse,
} from "@/types/api/generated";

export type SubscriptionPlan = Required<
  Pick<
    SubscriptionPlanResponse,
    | "id"
    | "code"
    | "displayName"
    | "maxUsers"
    | "maxClassrooms"
    | "maxCourses"
    | "hasPremiumFeatures"
    | "priceMonthly"
    | "currency"
  >
> &
  Omit<
    SubscriptionPlanResponse,
    | "id"
    | "code"
    | "displayName"
    | "maxUsers"
    | "maxClassrooms"
    | "maxCourses"
    | "hasPremiumFeatures"
    | "priceMonthly"
    | "currency"
  >;
export type OrganizationSubscriptionStatus = Omit<
  OrganizationSubscriptionStatusResponse,
  "organizationId" | "status" | "currentPeriodStart" | "currentPeriodEnd" | "plan"
> & {
  organizationId: string;
  status: NonNullable<OrganizationSubscriptionStatusResponse["status"]>;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  plan: SubscriptionPlan;
};
export type OrganizationSubscription = OrganizationSubscriptionResponse;
export type CreateCheckoutSessionPayload = CreateCheckoutSessionRequest;
export type CheckoutSession = CheckoutSessionResponse;
