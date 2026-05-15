"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PlanCard from "./PlanCard";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useGetSubscriptionPlansQuery } from "@/store/api/subscriptionsApi";
import type { SubscriptionPlan } from "@/types/domain/subscriptions";

type PlanSelectorProps = {
  selectedPlanId?: string;
  currentPlanId?: string;
  onPlanSelect?: (
    plan: SubscriptionPlan,
    meta: { source: "initial" | "user" }
  ) => void;
  actionLabel?: string;
  storageKey?: string;
  compact?: boolean;
};

function PlanSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`grid gap-4 ${
        compact ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"
      }`}
    >
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-64 animate-pulse rounded-2xl border border-brand-primary/10 bg-brand-card"
        />
      ))}
    </div>
  );
}

export default function PlanSelector({
  selectedPlanId,
  currentPlanId,
  onPlanSelect,
  actionLabel,
  storageKey,
  compact = false,
}: PlanSelectorProps) {
  const {
    data: plans = [],
    isLoading: loading,
    error,
  } = useGetSubscriptionPlansQuery();
  const [localSelectedId, setLocalSelectedId] = useState(selectedPlanId ?? "");
  const initializedRef = useRef(false);
  const storedPlanId = useMemo(
    () =>
      storageKey && typeof window !== "undefined"
        ? localStorage.getItem(storageKey) ?? ""
        : "",
    [storageKey],
  );
  const initialPlanId =
    selectedPlanId ||
    localSelectedId ||
    storedPlanId ||
    plans.find((plan) => plan.priceMonthly === 0)?.id ||
    plans[0]?.id ||
    "";

  useEffect(() => {
    if (plans.length === 0 || initializedRef.current) return;
    initializedRef.current = true;

    const initialPlan = plans.find((plan) => plan.id === initialPlanId);
    if (initialPlan) {
      onPlanSelect?.(initialPlan, { source: "initial" });
    }
  }, [initialPlanId, plans, onPlanSelect]);

  const selectedId = initialPlanId;

  const sortedPlans = useMemo(
    () => [...plans].sort((a, b) => a.priceMonthly - b.priceMonthly),
    [plans]
  );

  function handleSelect(plan: SubscriptionPlan) {
    setLocalSelectedId(plan.id);
    if (storageKey) {
      localStorage.setItem(storageKey, plan.id);
    }
    onPlanSelect?.(plan, { source: "user" });
  }

  if (loading) {
    return <PlanSkeleton compact={compact} />;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
        {getApiErrorMessage(error)}
      </div>
    );
  }

  if (sortedPlans.length === 0) {
    return (
      <div className="rounded-2xl border border-brand-primary/15 bg-brand-card p-4 text-sm text-brand-muted">
        No subscription plans are available.
      </div>
    );
  }

  return (
    <div
      className={`grid gap-4 ${
        compact ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"
      }`}
    >
      {sortedPlans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          selected={plan.id === selectedId}
          current={plan.id === currentPlanId}
          actionLabel={actionLabel}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
