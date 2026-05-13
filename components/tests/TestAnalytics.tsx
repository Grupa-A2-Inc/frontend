"use client";

import { useEffect, useState } from "react";
import { AlertCircle, BarChart3, Loader2, Target, TrendingDown, Trophy } from "lucide-react";

import { apiGetTestAnalytics } from "@/lib/tests/api";
import { TestAnalytics as TestAnalyticsData } from "@/lib/tests/types";

type Props = {
  testId: string;
};

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
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

export default function TestAnalytics({ testId }: Props) {
  const [analytics, setAnalytics] = useState<TestAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await apiGetTestAnalytics(testId);
        if (active) setAnalytics(data);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load test analytics.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [testId]);

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-brand-border bg-brand-card text-brand-muted">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading analytics...
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-5 text-red-300">
        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle className="h-5 w-5" />
          Failed to load analytics
        </div>
        <p className="mt-2 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-brand-border bg-brand-card p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-brand-primary/10 p-3 text-brand-primary">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-text">
              {analytics.title ?? "Test analytics"}
            </h2>
            <p className="mt-1 text-sm text-brand-muted">
              Attempts, pass rate, class average, and score distribution for this test.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Attempts"
          value={analytics.attemptsCount}
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <MetricCard
          label="Average score"
          value={formatPercent(analytics.averageScore)}
          icon={<Target className="h-4 w-4" />}
        />
        <MetricCard
          label="Pass rate"
          value={formatPercent(analytics.passRate)}
          icon={<Trophy className="h-4 w-4" />}
        />
        <MetricCard
          label="Failure rate"
          value={formatPercent(analytics.failureRate)}
          icon={<TrendingDown className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Class average" value={formatPercent(analytics.classAverage)} icon={<Target className="h-4 w-4" />} />
        <MetricCard label="Best score" value={formatPercent(analytics.bestScore)} icon={<Trophy className="h-4 w-4" />} />
        <MetricCard label="Worst score" value={formatPercent(analytics.worstScore)} icon={<TrendingDown className="h-4 w-4" />} />
      </div>

      <div className="rounded-xl border border-brand-border bg-brand-card p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-muted">
          Passed / failed
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4">
            <p className="text-sm text-green-300">Passed attempts</p>
            <p className="mt-1 text-2xl font-bold text-green-300">{analytics.passedCount}</p>
          </div>
          <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4">
            <p className="text-sm text-red-300">Failed attempts</p>
            <p className="mt-1 text-2xl font-bold text-red-300">{analytics.failedCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
