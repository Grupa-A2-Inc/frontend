import { Check, Crown, Users, GraduationCap, BookOpen } from "lucide-react";
import type { SubscriptionPlan } from "@/types/domain/subscriptions";
import { formatPrice } from "@/lib/subscriptions/utils";

type PlanCardProps = {
  plan: SubscriptionPlan;
  selected?: boolean;
  current?: boolean;
  disabled?: boolean;
  actionLabel?: string;
  onSelect?: (plan: SubscriptionPlan) => void;
};

function LimitItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-brand-text/75">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
        {icon}
      </span>
      <span>
        <span className="font-semibold text-brand-text">{value}</span> {label}
      </span>
    </div>
  );
}

export default function PlanCard({
  plan,
  selected = false,
  current = false,
  disabled = false,
  actionLabel = "Choose plan",
  onSelect,
}: PlanCardProps) {
  const price = formatPrice(plan.priceMonthly, plan.currency);

  return (
    <article
      className={`relative flex h-full flex-col rounded-2xl border p-5 transition-colors ${
        selected || current
          ? "border-brand-primary/70 bg-brand-primary/10"
          : "border-brand-primary/15 bg-brand-card hover:border-brand-primary/40"
      }`}
    >
      {(selected || current) && (
        <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-brand-primary text-white">
          <Check size={16} />
        </div>
      )}

      <div className="pr-10">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-brand-text">
            {plan.displayName}
          </h3>
          {plan.hasPremiumFeatures && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-xs font-semibold text-amber-300">
              <Crown size={12} />
              Premium
            </span>
          )}
        </div>
        <p className="mt-1 text-xs uppercase tracking-wide text-brand-muted">
          {plan.code}
        </p>
      </div>

      <div className="mt-5">
        <span className="text-3xl font-bold text-brand-text">{price}</span>
        {plan.priceMonthly > 0 && (
          <span className="text-sm text-brand-muted"> / month</span>
        )}
      </div>

      <div className="mt-5 flex flex-1 flex-col gap-3">
        <LimitItem
          icon={<Users size={16} />}
          label="users"
          value={plan.maxUsers}
        />
        <LimitItem
          icon={<GraduationCap size={16} />}
          label="classrooms"
          value={plan.maxClassrooms}
        />
        <LimitItem
          icon={<BookOpen size={16} />}
          label="courses"
          value={plan.maxCourses}
        />
      </div>

      <button
        type="button"
        disabled={disabled || selected || current}
        onClick={() => onSelect?.(plan)}
        className={`mt-6 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
          selected || current
            ? "cursor-default bg-brand-primary/20 text-brand-text"
            : disabled
            ? "cursor-not-allowed border border-brand-primary/15 text-brand-muted/60"
            : "bg-brand-primary text-white hover:bg-brand-primary/90"
        }`}
      >
        {current ? "Current plan" : selected ? "Selected" : actionLabel}
      </button>
    </article>
  );
}
