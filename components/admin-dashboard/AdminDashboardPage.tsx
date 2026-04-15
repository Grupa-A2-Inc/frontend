"use client";

import { useEffect, useState } from "react";
// Importam hook urile React pentru state si efecte

import {
  getDashboardStats,
  getOrganizationById,
  getOrganizationIdFromStorage,
  getAccessToken,
} from "@/lib/admin-dashboard/api";
// Functiile care fac request-uri catre backend sau citesc date din localStorage

import AdminKpiGrid from "./AdminKpiGrid";
import OrganizationSummaryCard from "./OrganizationSummaryCard";
import AdminQuickLinks from "./AdminQuickLinks";
import AdminStatusBanner from "./AdminStatusBanner";
import { AdminDashboardStats, OrganizationProfile } from "@/lib/admin-dashboard/types";
// Componente vizuale ale dashboard-ului

export default function AdminDashboardPage() {

  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [organization, setOrganization] = useState<OrganizationProfile | null>(null);

  const [isInitialLoading, setIsInitialLoading] = useState(false);

  async function loadDashboard() {

    if (stats && organization) return;

    setIsInitialLoading(true);

    const token = getAccessToken();
    const organizationId = getOrganizationIdFromStorage();

    if (!token || !organizationId) {
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

    } finally {
      setIsInitialLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  // ---------- LOADING STATE ----------
  if (isInitialLoading || !stats || !organization) {
    return (
      <div className="w-full px-6 py-10 space-y-10">
        {/* Skeleton pentru titlu */}
        <div className="space-y-2">
          <div className="h-8 w-56 animate-pulse rounded bg-[rgb(var(--skeleton-bg-1))]" />
          <div className="h-4 w-80 animate-pulse rounded bg-[rgb(var(--skeleton-bg-2))]" />
        </div>

        {/* Skeleton pentru KPI Grid */}
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl bg-[rgb(var(--skeleton-bg-1))]"
            />
          ))}
        </div>

        {/* Skeleton pentru Summary + Quick Links */}
        <div className="grid gap-10 xl:grid-cols-[1.35fr_1fr]">
          <div className="h-[360px] animate-pulse rounded-2xl bg-[rgb(var(--skeleton-bg-1))]" />
          <div className="h-[360px] animate-pulse rounded-2xl bg-[rgb(var(--skeleton-bg-1))]" />
        </div>
      </div>
    );
  }

  // ---------- MAIN DASHBOARD UI
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
