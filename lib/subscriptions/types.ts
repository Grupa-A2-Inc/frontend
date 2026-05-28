export type SubscriptionPlan = {
  id: string;
  code: string;
  displayName: string;
  maxUsers: number | null;
  maxClassrooms: number | null;
  maxCourses: number | null;
  hasPremiumFeatures: boolean;
  priceMonthly: number | null;
  currency: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SubscriptionStatus =
  | "ACTIVE"
  | "TRIALING"
  | "PAST_DUE"
  | "CANCELED"
  | "EXPIRED";

export type SubscriptionProvider = "STRIPE" | "MANUAL" | "INTERNAL";

export type OrganizationSubscriptionStatus = {
  organizationId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  plan: SubscriptionPlan;
};

export type OrganizationSubscription = {
  id: string;
  organizationId: string;
  subscriptionPlanId: string;
  status: SubscriptionStatus;
  provider: SubscriptionProvider;
  providerCustomerId: string;
  providerSubscriptionId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateCheckoutSessionRequest = {
  planId: string;
  successUrl: string;
  cancelUrl: string;
};

export type CheckoutSessionResponse = {
  checkoutUrl: string;
  sessionId: string;
};
