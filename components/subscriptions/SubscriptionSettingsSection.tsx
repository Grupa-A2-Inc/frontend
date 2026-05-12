"use client";

import { useCallback, useMemo, useState } from "react";
import {
  AlertCircle,
  CreditCard,
  ExternalLink,
  Loader2,
  RefreshCcw,
  X,
  XCircle,
} from "lucide-react";
import PlanSelector from "./PlanSelector";
import type { SubscriptionPlan } from "@/lib/subscriptions/types";

const SETTINGS_PLAN_KEY = "adminSelectedSubscriptionPlanId";

type SubscriptionActionId = "checkout" | "change" | "portal" | "cancel";
type ActionStatus = "idle" | "loading" | "success" | "error";

type SubscriptionAction = {
  id: SubscriptionActionId;
  title: string;
  description: string;
  endpointHint: string;
  confirmLabel: string;
  tone?: "default" | "danger";
  icon: React.ReactNode;
};

const SUBSCRIPTION_ACTIONS: SubscriptionAction[] = [
  {
    id: "checkout",
    title: "Checkout",
    description: "Start Stripe checkout for the selected plan.",
    endpointHint: "POST /api/v1/payments/checkout-session",
    confirmLabel: "Continue to Stripe",
    icon: <CreditCard size={16} />,
  },
  {
    id: "change",
    title: "Change plan",
    description: "Confirm an upgrade or downgrade for this organization.",
    endpointHint: "POST /api/v1/subscriptions/change-plan",
    confirmLabel: "Confirm change",
    icon: <RefreshCcw size={16} />,
  },
  {
    id: "portal",
    title: "Billing portal",
    description: "Open the hosted billing portal for invoices and cards.",
    endpointHint: "GET /api/v1/payments/billing-portal",
    confirmLabel: "Open portal",
    icon: <ExternalLink size={16} />,
  },
  {
    id: "cancel",
    title: "Cancel subscription",
    description: "Cancel the active subscription after admin confirmation.",
    endpointHint: "POST /api/v1/subscriptions/cancel",
    confirmLabel: "Cancel subscription",
    tone: "danger",
    icon: <XCircle size={16} />,
  },
];

function formatPrice(value: number, currency: string): string {
  if (value === 0) return "Free";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "EUR",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value} ${currency}`.trim();
  }
}

function ActionButton({
  action,
  onClick,
}: {
  action: SubscriptionAction;
  onClick: (action: SubscriptionAction) => void;
}) {
  const isDanger = action.tone === "danger";

  return (
    <button
      type="button"
      onClick={() => onClick(action)}
      className={`flex h-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
        isDanger
          ? "border-red-500/25 bg-red-500/10 hover:bg-red-500/15"
          : "border-brand-primary/15 bg-brand-mid hover:border-brand-primary/40"
      }`}
    >
      <span
        className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
          isDanger
            ? "bg-red-500/15 text-red-400"
            : "bg-brand-primary/10 text-brand-primary"
        }`}
      >
        {action.icon}
      </span>
      <span className="min-w-0">
        <span
          className={`block text-sm font-semibold ${
            isDanger ? "text-red-300" : "text-brand-text"
          }`}
        >
          {action.title}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-brand-muted">
          {action.description}
        </span>
        <span className="mt-2 inline-flex rounded-full border border-brand-primary/15 px-2 py-0.5 text-[11px] font-semibold text-brand-muted">
          Pending backend
        </span>
      </span>
    </button>
  );
}

function ActionModal({
  action,
  selectedPlan,
  status,
  message,
  onClose,
  onConfirm,
}: {
  action: SubscriptionAction;
  selectedPlan: SubscriptionPlan | null;
  status: ActionStatus;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const isDanger = action.tone === "danger";
  const price = selectedPlan
    ? formatPrice(selectedPlan.priceMonthly, selectedPlan.currency)
    : "";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-brand-primary/20 bg-brand-card p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div
              className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${
                isDanger
                  ? "bg-red-500/15 text-red-400"
                  : "bg-brand-primary/10 text-brand-primary"
              }`}
            >
              {action.icon}
            </div>
            <h3 className="text-lg font-bold text-brand-text">
              {action.title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-brand-muted">
              {action.description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-brand-muted hover:bg-brand-mid hover:text-brand-text"
            aria-label="Close subscription action"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 rounded-xl border border-brand-primary/15 bg-brand-mid p-4">
          <p className="text-xs font-semibold uppercase text-brand-muted">
            Selected plan
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-brand-text">
              {selectedPlan ? selectedPlan.displayName : "No plan selected"}
            </p>
            {selectedPlan && (
              <p className="text-sm font-bold text-brand-text">
                {price}
                {selectedPlan.priceMonthly > 0 && (
                  <span className="font-normal text-brand-muted"> / month</span>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/10 p-4">
          <div className="flex gap-3">
            <AlertCircle
              size={18}
              className="mt-0.5 flex-shrink-0 text-amber-300"
            />
            <div>
              <p className="text-sm font-semibold text-amber-200">
                Backend endpoint pending
              </p>
              <p className="mt-1 text-xs leading-relaxed text-amber-100/80">
                This modal is ready for the integration. The expected endpoint is{" "}
                <span className="font-mono">{action.endpointHint}</span>.
              </p>
            </div>
          </div>
        </div>

        {message && (
          <p
            className={`mt-4 rounded-xl px-4 py-3 text-sm ${
              status === "success"
                ? "bg-green-500/10 text-green-300"
                : "bg-red-500/10 text-red-300"
            }`}
          >
            {message}
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-brand-primary/15 px-4 py-2 text-sm font-semibold text-brand-text hover:bg-brand-mid"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={status === "loading"}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-70 ${
              isDanger
                ? "bg-red-500 hover:bg-red-500/90"
                : "bg-brand-primary hover:bg-brand-primary/90"
            }`}
          >
            {status === "loading" && <Loader2 size={16} className="animate-spin" />}
            {status === "loading" ? "Preparing..." : action.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSettingsSection() {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const [savedPlanId, setSavedPlanId] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(SETTINGS_PLAN_KEY) ?? "";
  });
  const [saved, setSaved] = useState(false);
  const [activeAction, setActiveAction] = useState<SubscriptionAction | null>(
    null
  );
  const [actionStatus, setActionStatus] = useState<ActionStatus>("idle");
  const [actionMessage, setActionMessage] = useState("");

  const visibleActions = useMemo(
    () => SUBSCRIPTION_ACTIONS.filter((action) => action.id !== "cancel"),
    []
  );
  const cancelAction = SUBSCRIPTION_ACTIONS.find(
    (action) => action.id === "cancel"
  );

  const handlePlanSelect = useCallback(
    (plan: SubscriptionPlan, meta: { source: "initial" | "user" }) => {
      setSelectedPlan(plan);
      setSavedPlanId(plan.id);

      if (meta.source === "user") {
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2200);
      }
    },
    []
  );

  function openAction(action: SubscriptionAction) {
    setActiveAction(action);
    setActionStatus("idle");
    setActionMessage("");
  }

  function closeAction() {
    setActiveAction(null);
    setActionStatus("idle");
    setActionMessage("");
  }

  function handlePreparedAction() {
    if (!activeAction) return;

    setActionStatus("loading");
    setActionMessage("");

    window.setTimeout(() => {
      setActionStatus("error");
      setActionMessage(
        `Cannot run "${activeAction.title}" until ${activeAction.endpointHint} is available.`
      );
    }, 500);
  }

  return (
    <section className="mb-5 rounded-2xl border border-brand-primary/15 bg-brand-card p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-brand-text">
            Subscription Plan
          </h2>
          <p className="mt-1 text-xs text-brand-muted">
            View and choose the organization plan.
          </p>
        </div>
        <div className="rounded-full border border-brand-primary/20 bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-text">
          {selectedPlan ? selectedPlan.displayName : "Loading plan"}
        </div>
      </div>

      <PlanSelector
        compact
        selectedPlanId={savedPlanId}
        storageKey={SETTINGS_PLAN_KEY}
        actionLabel="Switch visually"
        onPlanSelect={handlePlanSelect}
      />

      {saved && (
        <p className="mt-3 text-xs font-medium text-green-400">
          Plan selection saved locally.
        </p>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {visibleActions.map((action) => (
          <ActionButton
            key={action.id}
            action={action}
            onClick={openAction}
          />
        ))}
      </div>

      {cancelAction && (
        <div className="mt-3">
          <ActionButton action={cancelAction} onClick={openAction} />
        </div>
      )}

      {activeAction && (
        <ActionModal
          action={activeAction}
          selectedPlan={selectedPlan}
          status={actionStatus}
          message={actionMessage}
          onClose={closeAction}
          onConfirm={handlePreparedAction}
        />
      )}
    </section>
  );
}

