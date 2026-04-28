"use client";

import { useEffect, useState } from "react";

import {
  getDashboardStats,
  getOrganizationById,
  getOrganizationIdFromStorage,
  getAccessToken,
} from "@/lib/admin-dashboard/api";

import AdminKpiGrid from "./AdminKpiGrid";
import OrganizationSummaryCard from "./OrganizationSummaryCard";
import AdminQuickLinks from "./AdminQuickLinks";
import AdminStatusBanner from "./AdminStatusBanner";
import { AdminDashboardStats, OrganizationProfile } from "@/lib/admin-dashboard/types";

export default function AdminDashboardPage() {

  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [organization, setOrganization] = useState<OrganizationProfile | null>(null);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

async function loadDashboard(force = false) {
  if (!force && stats && organization) return;

  setIsInitialLoading(true);
  setErrorMessage("");

  const token = getAccessToken();
  const organizationId = getOrganizationIdFromStorage();

  if (!token || !organizationId) {
    setErrorMessage("Missing session data. Please sign in again.");
    setIsInitialLoading(false);
    return;
  }

  try {
    const [statsData, organizationData] = await Promise.all([
      getDashboardStats(),
      getOrganizationById(organizationId),
    ]);

    setStats(statsData);
    setOrganization(organizationData);
  } catch (error) {
    setErrorMessage(
      error instanceof Error
        ? error.message
        : "Failed to load admin dashboard data."
    );
  } finally {
    setIsInitialLoading(false);
  }
}

  useEffect(() => {
    loadDashboard();
  }, []);

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
          setStats(null);
          setOrganization(null);
          loadDashboard(true);
        }}
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
          message={`${stats.warnings?.length ?? 0} issues require your attention`}        />
      )}

      {/* Summary + Quick Links */}
      <div className="grid gap-10 xl:grid-cols-[1.35fr_1fr]">
        <OrganizationSummaryCard
          organization={organization}
          onOrganizationUpdated={(fresh: OrganizationProfile) => setOrganization(fresh)}
        />
        <AdminQuickLinks />
      </div>
    </div>
  );
}
