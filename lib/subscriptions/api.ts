import type { SubscriptionPlan } from "./types";

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

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const response = await fetch(`${API_BASE}/api/v1/subscription-plans`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load subscription plans.");
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Subscription plans response has an unexpected format.");
  }

  return data.filter(isSubscriptionPlan);
}

