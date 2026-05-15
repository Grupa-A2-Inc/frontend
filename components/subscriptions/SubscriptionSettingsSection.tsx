"use client";

import { useCallback, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  RefreshCcw,
  X,
} from "lucide-react";
import PlanSelector from "./PlanSelector";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  useChangeOrganizationSubscriptionPlanMutation,
  useCreateSubscriptionCheckoutSessionMutation,
  useGetCurrentOrganizationSubscriptionQuery,
} from "@/store/api/subscriptionsApi";
import type {
  OrganizationSubscriptionStatus,
  SubscriptionPlan,
} from "@/types/domain/subscriptions";
import { formatPrice } from "@/lib/subscriptions/utils";
import { useAppSelector } from "@/store/hooks";

type SubscriptionActionId = "checkout" | "change";
type ActionStatus = "idle" | "loading" | "success" | "error";

type SubscriptionAction = {
  id: SubscriptionActionId;
  title: string;
  description: string;
  confirmLabel: string;
  icon: React.ReactNode;
};

const SUBSCRIPTION_ACTIONS: SubscriptionAction[] = [
  {
    id: "checkout",
    title: "Checkout",
    description: "Create a Stripe checkout session for the selected plan.",
    confirmLabel: "Continue to Stripe",
    icon: <CreditCard size={16} />,
  },
  {
    id: "change",
    title: "Change plan",
    description: "Update the active subscription to the selected plan.",
    confirmLabel: "Confirm change",
    icon: <RefreshCcw size={16} />,
  },
];

function formatDate(value?: string): string {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function ActionButton({
  action,
  disabled,
  onClick,
}: {
  action: SubscriptionAction;
  disabled?: boolean;
  onClick: (action: SubscriptionAction) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onClick(action)}
      className="flex h-full items-start gap-3 rounded-xl border border-brand-primary/15 bg-brand-mid px-4 py-3 text-left transition-colors hover:border-brand-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
        {action.icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-brand-text">
          {action.title}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-brand-muted">
          {action.description}
        </span>
      </span>
    </button>
  );
}

function ActionModal({
  action,
  selectedPlan,
  currentSubscription,
  status,
  message,
  onClose,
  onConfirm,
}: {
  action: SubscriptionAction;
  selectedPlan: SubscriptionPlan | null;
  currentSubscription: OrganizationSubscriptionStatus | null;
  status: ActionStatus;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const price = selectedPlan
    ? formatPrice(selectedPlan.priceMonthly, selectedPlan.currency)
    : "";
  const isCurrentPlan =
    action.id === "change" &&
    selectedPlan?.id === currentSubscription?.plan.id;
  const confirmDisabled =
    status === "loading" || !selectedPlan || isCurrentPlan;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-brand-primary/20 bg-brand-card p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
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

        {isCurrentPlan && (
          <div className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/10 p-4">
            <div className="flex gap-3">
              <AlertCircle
                size={18}
                className="mt-0.5 flex-shrink-0 text-amber-300"
              />
              <p className="text-sm leading-relaxed text-amber-100/90">
                This plan is already active for the organization.
              </p>
            </div>
          </div>
        )}

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
            disabled={confirmDisabled}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "loading" && (
              <Loader2 size={16} className="animate-spin" />
            )}
            {status === "loading" ? "Preparing..." : action.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSettingsSection() {
  const organizationId = useAppSelector(
    (state) => state.auth.organization?.id ?? state.auth.user?.organizationId ?? ""
  );
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const {
    data: currentSubscription,
    isLoading: subscriptionLoading,
    error: subscriptionError,
    refetch: refetchCurrentSubscription,
  } = useGetCurrentOrganizationSubscriptionQuery(organizationId, {
    skip: !organizationId,
  });
  const [createCheckoutSession] = useCreateSubscriptionCheckoutSessionMutation();
  const [changeSubscriptionPlan] = useChangeOrganizationSubscriptionPlanMutation();
  const [planNotice, setPlanNotice] = useState(false);
  const [activeAction, setActiveAction] = useState<SubscriptionAction | null>(
    null
  );
  const [actionStatus, setActionStatus] = useState<ActionStatus>("idle");
  const [actionMessage, setActionMessage] = useState("");

  const selectedPlanId = selectedPlan?.id ?? currentSubscription?.plan.id ?? "";
  const actionsDisabled = !organizationId || subscriptionLoading;

  const subscriptionSummary = useMemo(() => {
    if (subscriptionLoading) return "Loading subscription";
    if (!currentSubscription) return "No subscription";
    return `${currentSubscription.status}: ${currentSubscription.plan.displayName}`;
  }, [currentSubscription, subscriptionLoading]);

  const handlePlanSelect = useCallback(
    (plan: SubscriptionPlan, meta: { source: "initial" | "user" }) => {
      setSelectedPlan(plan);

      if (meta.source === "user") {
        setPlanNotice(true);
        window.setTimeout(() => setPlanNotice(false), 2200);
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

  async function handleSubscriptionAction() {
    if (!activeAction || !selectedPlan) return;

    if (!organizationId) {
      setActionStatus("error");
      setActionMessage("Organization was not found. Please sign in again.");
      return;
    }

    setActionStatus("loading");
    setActionMessage("");

    try {
      if (activeAction.id === "checkout") {
        const returnPath = window.location.pathname;
        const successUrl = `${window.location.origin}${returnPath}?subscription=success`;
        const cancelUrl = `${window.location.origin}${returnPath}?subscription=cancel`;

        const session = await createCheckoutSession({
          organizationId,
          data: {
            planId: selectedPlan.id,
            successUrl,
            cancelUrl,
          },
        }).unwrap();

        if (!session.checkoutUrl) {
          throw new Error("Checkout session did not include a checkout URL.");
        }

        setActionStatus("success");
        setActionMessage("Checkout session created. Redirecting to Stripe...");
        window.location.assign(session.checkoutUrl);
        return;
      }

      await changeSubscriptionPlan({
        organizationId,
        planId: selectedPlan.id,
      }).unwrap();
      const subscription = await refetchCurrentSubscription().unwrap();

      if (subscription) {
        setSelectedPlan(subscription.plan);
      }

      setActionStatus("success");
      setActionMessage("Subscription plan changed successfully.");
    } catch (error) {
      setActionStatus("error");
      setActionMessage(getApiErrorMessage(error));
    }
  }

  return (
    <section className="mb-5 rounded-2xl border border-brand-primary/15 bg-brand-card p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-brand-text">
            Subscription Plan
          </h2>
          <p className="mt-1 text-xs text-brand-muted">
            View and manage the organization subscription.
          </p>
        </div>
        <div className="rounded-full border border-brand-primary/20 bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-text">
          {subscriptionSummary}
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-brand-primary/15 bg-brand-mid p-4">
        {subscriptionLoading ? (
          <div className="flex items-center gap-2 text-sm text-brand-muted">
            <Loader2 size={16} className="animate-spin" />
            Loading current subscription...
          </div>
        ) : currentSubscription ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={18}
                className="mt-0.5 flex-shrink-0 text-green-400"
              />
              <div>
                <p className="text-sm font-semibold text-brand-text">
                  {currentSubscription.plan.displayName}
                </p>
                <p className="mt-1 text-xs text-brand-muted">
                  Status: {currentSubscription.status}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-brand-muted">
              <CalendarDays size={16} />
              {formatDate(currentSubscription.currentPeriodStart)} -{" "}
              {formatDate(currentSubscription.currentPeriodEnd)}
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <AlertCircle
              size={18}
              className="mt-0.5 flex-shrink-0 text-amber-300"
            />
            <div>
              <p className="text-sm font-semibold text-brand-text">
                No current subscription loaded.
              </p>
              {subscriptionError && (
                <p className="mt-1 text-xs leading-relaxed text-brand-muted">
                  {getApiErrorMessage(subscriptionError)}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <PlanSelector
        compact
        selectedPlanId={selectedPlanId}
        currentPlanId={currentSubscription?.plan.id}
        actionLabel="Select plan"
        onPlanSelect={handlePlanSelect}
      />

      {planNotice && (
        <p className="mt-3 text-xs font-medium text-green-400">
          Plan selected. Choose checkout or change plan to apply it.
        </p>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {SUBSCRIPTION_ACTIONS.map((action) => (
          <ActionButton
            key={action.id}
            action={action}
            disabled={actionsDisabled}
            onClick={openAction}
          />
        ))}
      </div>

      {activeAction && (
        <ActionModal
          action={activeAction}
          selectedPlan={selectedPlan}
          currentSubscription={currentSubscription ?? null}
          status={actionStatus}
          message={actionMessage}
          onClose={closeAction}
          onConfirm={handleSubscriptionAction}
        />
      )}
    </section>
  );
}
