"use client";

import { getApiErrorMessage } from "@/lib/api/errors";
import {
  useGetAdminDashboardStatsQuery,
  useGetOrganizationByIdQuery,
} from "@/store/api/organizationsApi";
import { useAppSelector } from "@/store/hooks";

import AdminKpiGrid from "./AdminKpiGrid";
import OrganizationSummaryCard from "./OrganizationSummaryCard";
import AdminQuickLinks from "./AdminQuickLinks";
import AdminStatusBanner from "./AdminStatusBanner";

export default function AdminDashboardPage() {
  const organizationId = useAppSelector((state) => state.auth.user?.organizationId);
  const {
    data: organization,
    isLoading: isOrganizationLoading,
    error: organizationError,
    refetch: refetchOrganization,
  } = useGetOrganizationByIdQuery(organizationId ?? "", { skip: !organizationId });
  const {
    data: stats,
    isLoading: isStatsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useGetAdminDashboardStatsQuery(undefined, { skip: !organizationId });

  const isInitialLoading = isOrganizationLoading || isStatsLoading;
  const errorMessage =
    !organizationId
      ? "Missing session data. Please sign in again."
      : organizationError || statsError
        ? getApiErrorMessage(organizationError ?? statsError)
        : "";

  if (isInitialLoading) {
  return (
    <div className="w-full px-6 py-10 space-y-10">
      <div className="space-y-2">
        <div className="h-8 w-56 animate-pulse rounded bg-[rgb(var(--skeleton-bg-1))]" />
        <div className="h-4 w-80 animate-pulse rounded bg-[rgb(var(--skeleton-bg-2))]" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl bg-[rgb(var(--skeleton-bg-1))]"
          />
        ))}
      </div>

      <div className="grid gap-10 xl:grid-cols-[1.35fr_1fr]">
        <div className="h-[360px] animate-pulse rounded-2xl bg-[rgb(var(--skeleton-bg-1))]" />
        <div className="h-[360px] animate-pulse rounded-2xl bg-[rgb(var(--skeleton-bg-1))]" />
      </div>
    </div>
  );
}

  if (errorMessage) {
  return (
    <div className="w-full px-6 py-10 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-[rgb(var(--text-primary))]">
          Admin Dashboard
        </h1>
        <p className="text-sm text-[rgb(var(--text-secondary))]">
          Overview of your organization, key metrics, and quick access to main admin areas.
        </p>
      </div>

      <AdminStatusBanner variant="error" message={errorMessage} />

      <button
        onClick={() => {
          if (!organizationId) return;
          refetchOrganization();
          refetchStats();
        }}
        disabled={!organizationId}
        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
      >
        Retry
      </button>
    </div>
  );
}

if (!stats || !organization) {
  return null;
}

  return (
    <div className="w-full px-6 py-10 space-y-10">
      {/* Titlu */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-[rgb(var(--text-primary))]">
          Admin Dashboard
        </h1>
        <p className="text-sm text-[rgb(var(--text-secondary))]">
          Overview of your organization, key metrics, and quick access to main admin areas.
        </p>
      </div>

      {/* KPI Grid */}
      <AdminKpiGrid stats={stats} />

      {/* Banner de warning (daca exista) */}
      {(stats.warnings?.length ?? 0) > 0 && (
        <AdminStatusBanner
          variant="warning"
          message={`${stats.warnings?.length ?? 0} issues require your attention`}
        />
      )}

      {/* Summary + Quick Links */}
      <div className="grid gap-10 xl:grid-cols-[1.35fr_1fr]">
        <OrganizationSummaryCard
          organization={organization}
          onOrganizationUpdated={() => refetchOrganization()}
        />
        <AdminQuickLinks />
      </div>
    </div>
  );
}
