import { fetchWithAuth } from "@/lib/fetchWithAuth";
import type {
  CheckoutSessionResponse,
  CreateCheckoutSessionRequest,
  OrganizationSubscription,
  OrganizationSubscriptionStatus,
  SubscriptionPlan,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.adaptiveelearning.online";

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

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

function requireAccessToken(): string {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Access token was not found. Please sign in again.");
  }

  return token;
}

function getOrganizationSubscriptionUrl(organizationId: string): string {
  return `${API_BASE}/api/v1/organizations/${encodeURIComponent(
    organizationId
  )}/subscription`;
}

async function getErrorMessage(response: Response): Promise<string> {
  const fallbackByStatus: Record<number, string> = {
    400: "Invalid subscription request data.",
    401: "Please sign in.",
    403: "You do not have permission to manage this subscription.",
    404: "Organization or subscription was not found.",
  };

  try {
    const data = await response.json();
    if (typeof data?.message === "string") return data.message;
    if (typeof data?.error === "string") return data.error;
  } catch {
    // Keep the status-based fallback below.
  }

  return fallbackByStatus[response.status] ?? "Subscription request failed.";
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const token = getAccessToken();
  const request: RequestInit = {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  };
  const url = `${API_BASE}/api/v1/subscription-plans`;
  const response = token
    ? await fetchWithAuth(url, token, request)
    : await fetch(url, request);

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Subscription plans response has an unexpected format.");
  }

  return data.filter(isSubscriptionPlan);
}

export async function getCurrentOrganizationSubscription(
  organizationId: string
): Promise<OrganizationSubscriptionStatus> {
  const token = requireAccessToken();

  const response = await fetchWithAuth(
    getOrganizationSubscriptionUrl(organizationId),
    token,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function createSubscriptionCheckoutSession(
  organizationId: string,
  payload: CreateCheckoutSessionRequest
): Promise<CheckoutSessionResponse> {
  const token = requireAccessToken();

  const response = await fetchWithAuth(
    `${getOrganizationSubscriptionUrl(organizationId)}/checkout`,
    token,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function changeOrganizationSubscriptionPlan(
  organizationId: string,
  planId: string
): Promise<OrganizationSubscription> {
  const token = requireAccessToken();

  const response = await fetchWithAuth(
    getOrganizationSubscriptionUrl(organizationId),
    token,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ planId }),
    }
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}
