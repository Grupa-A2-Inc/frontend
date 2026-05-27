"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  BellRing,
  BookOpen,
  ExternalLink,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { fetchTeacherAlertsDashboardData } from "@/lib/teacher-alerts/api";
import type { TeacherAlertWithContext } from "@/lib/teacher-alerts/types";

type LoadState = "loading" | "ready" | "error";

function getSeverity(alert: TeacherAlertWithContext) {
  return alert.currentFailureRate - alert.failureThreshold;
}

function isTriggered(alert: TeacherAlertWithContext) {
  return alert.currentFailureRate >= alert.failureThreshold;
}

function formatRate(value: number) {
  return `${Math.round(value)}%`;
}

function shortId(id: string) {
  return id ? id.slice(0, 8) : "unknown";
}

export default function TeacherAlertsPage() {
  const [alerts, setAlerts] = useState<TeacherAlertWithContext[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchTeacherAlertsDashboardData()
      .then((data) => {
        if (!active) return;
        setAlerts(data);
        setError(null);
        setLoadState("ready");
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load alerts.");
        setLoadState("error");
      });

    return () => {
      active = false;
    };
  }, []);

  function handleRetry() {
    setLoadState("loading");
    setError(null);

    fetchTeacherAlertsDashboardData()
      .then((data) => {
        setAlerts(data);
        setLoadState("ready");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load alerts.");
        setLoadState("error");
      });
  }

  const sortedAlerts = useMemo(
    () => [...alerts].sort((a, b) => getSeverity(b) - getSeverity(a)),
    [alerts],
  );

  const triggeredCount = sortedAlerts.filter(isTriggered).length;
  const activeCount = sortedAlerts.filter((alert) => alert.isActive).length;
  const averageFailureRate =
    sortedAlerts.length > 0
      ? sortedAlerts.reduce((total, alert) => total + alert.currentFailureRate, 0) /
        sortedAlerts.length
      : 0;

  return (
    <main className="mx-auto max-w-6xl p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 border-b border-brand-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-extrabold text-brand-text">
            <BellRing className="text-brand-primary" size={32} />
            Alerts
          </h1>
          <p className="mt-1 text-sm text-brand-muted">
            Monitor tests whose failure rates need attention.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRetry}
          disabled={loadState === "loading"}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-border bg-brand-card px-4 py-2 text-sm font-medium text-brand-text transition hover:border-brand-primary/50 disabled:opacity-60"
        >
          {loadState === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </button>
      </div>

      {loadState === "loading" && (
        <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-brand-border bg-brand-card text-brand-muted">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading alerts...
        </div>
      )}

      {loadState === "error" && (
        <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-5 text-red-300">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle className="h-5 w-5" />
            Failed to load alerts
          </div>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      )}

      {loadState === "ready" && sortedAlerts.length === 0 && (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-brand-border bg-brand-card p-8 text-center">
          <BellRing className="mb-3 h-10 w-10 text-brand-primary/60" />
          <p className="font-semibold text-brand-text">No active alerts right now.</p>
          <p className="mt-1 text-sm text-brand-muted">
            Failure-rate alerts will appear here when configured thresholds are active.
          </p>
        </div>
      )}

      {loadState === "ready" && sortedAlerts.length > 0 && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard
              icon={<AlertTriangle className="h-4 w-4" />}
              label="Triggered"
              value={triggeredCount}
            />
            <MetricCard
              icon={<Activity className="h-4 w-4" />}
              label="Active alerts"
              value={activeCount}
            />
            <MetricCard
              icon={<BarChart3 className="h-4 w-4" />}
              label="Avg failure rate"
              value={formatRate(averageFailureRate)}
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-brand-border bg-brand-card">
            <div className="border-b border-brand-border px-5 py-4">
              <h2 className="font-semibold text-brand-text">Failure-rate alerts</h2>
              <p className="mt-1 text-sm text-brand-muted">
                Sorted by the largest gap over threshold.
              </p>
            </div>

            <div className="divide-y divide-brand-border">
              {sortedAlerts.map((alert) => (
                <AlertRow key={alert.alertId} alert={alert} />
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-card p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-brand-muted">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold text-brand-text">{value}</p>
    </div>
  );
}

function AlertRow({ alert }: { alert: TeacherAlertWithContext }) {
  const triggered = isTriggered(alert);
  const context = alert.context;
  const analyticsHref = context
    ? `/dashboard/teacher/courses/${context.courseId}/tests/${alert.testId}/analytics`
    : null;
  const editorHref = context
    ? `/dashboard/teacher/courses/${context.courseId}/lessons/${context.lessonId}/test-builder`
    : null;

  return (
    <article className="grid gap-4 px-5 py-5 lg:grid-cols-[1.5fr_1fr_auto] lg:items-center">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              triggered
                ? "bg-red-500/10 text-red-400"
                : "bg-emerald-500/10 text-emerald-400"
            }`}
          >
            {triggered ? "Triggered" : "Within threshold"}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              alert.isActive
                ? "bg-brand-primary/10 text-brand-primary"
                : "bg-brand-muted/10 text-brand-muted"
            }`}
          >
            {alert.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <h3 className="truncate text-base font-semibold text-brand-text">
          {context?.lessonTitle ?? `Test ${shortId(alert.testId)}`}
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-brand-muted">
          <BookOpen className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">
            {context?.courseTitle ?? `Test ID: ${alert.testId}`}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
        <RateStat label="Current" value={formatRate(alert.currentFailureRate)} tone={triggered ? "red" : "green"} />
        <RateStat label="Threshold" value={formatRate(alert.failureThreshold)} tone="neutral" />
        <RateStat label="Gap" value={formatRate(getSeverity(alert))} tone={triggered ? "red" : "green"} />
      </div>

      <div className="flex flex-wrap gap-2 lg:justify-end">
        {analyticsHref ? (
          <Link
            href={analyticsHref}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-primary/90"
          >
            <BarChart3 className="h-4 w-4" />
            Open analytics
          </Link>
        ) : (
          <DisabledAction label="Open analytics" />
        )}

        {editorHref ? (
          <Link
            href={editorHref}
            className="inline-flex items-center gap-2 rounded-lg border border-brand-border px-3 py-2 text-sm font-medium text-brand-text transition hover:border-brand-primary/50"
          >
            <ExternalLink className="h-4 w-4" />
            Open test editor
          </Link>
        ) : (
          <DisabledAction label="Open test editor" />
        )}
      </div>
    </article>
  );
}

function RateStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "red" | "green" | "neutral";
}) {
  const toneClass = {
    red: "text-red-400",
    green: "text-emerald-400",
    neutral: "text-brand-text",
  }[tone];

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-brand-muted">{label}</p>
      <p className={`mt-1 font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

function DisabledAction({ label }: { label: string }) {
  return (
    <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-brand-border px-3 py-2 text-sm font-medium text-brand-muted opacity-60">
      {label}
    </span>
  );
}
