"use client";

import { useEffect, useMemo, useState } from "react";
import PlanCard from "./PlanCard";
import { getSubscriptionPlans } from "@/lib/subscriptions/api";
import type { SubscriptionPlan } from "@/lib/subscriptions/types";

type PlanSelectorProps = {
  selectedPlanId?: string;
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
  onPlanSelect,
  actionLabel,
  storageKey,
  compact = false,
}: PlanSelectorProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [localSelectedId, setLocalSelectedId] = useState(selectedPlanId ?? "");

  useEffect(() => {
    let mounted = true;

    async function loadPlans() {
      try {
        const nextPlans = await getSubscriptionPlans();
        if (!mounted) return;

        setPlans(nextPlans);
        setError("");

        const storedPlanId = storageKey
          ? localStorage.getItem(storageKey) ?? ""
          : "";
        const initialPlanId =
          selectedPlanId ||
          storedPlanId ||
          nextPlans.find((plan) => plan.priceMonthly === 0)?.id ||
          nextPlans[0]?.id ||
          "";

        setLocalSelectedId(initialPlanId);

        const initialPlan = nextPlans.find((plan) => plan.id === initialPlanId);
        if (initialPlan) {
          onPlanSelect?.(initialPlan, { source: "initial" });
        }
      } catch {
        if (!mounted) return;
        setError("Subscription plans could not be loaded.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPlans();

    return () => {
      mounted = false;
    };
  }, [onPlanSelect, selectedPlanId, storageKey]);

  const selectedId = selectedPlanId ?? localSelectedId;

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
        {error}
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
          actionLabel={actionLabel}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
