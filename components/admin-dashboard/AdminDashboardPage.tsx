"use client";

import { useEffect, useState } from "react";
// Importam hook urile React pentru state si efecte

import { AdminDashboardStats, OrganizationProfile } from "@/lib/admin-dashboard/types";
// Tipurile Typescript pentru datele pe care le primim din backend

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
// Componente vizuale ale dashboard-ului

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);

  const [organization, setOrganization] = useState<OrganizationProfile | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  async function loadDashboard() {
    // Functia principala care incarca datele dashboard-ului
    try {
      setIsLoading(true);
      setErrorMessage("");

      const token = getAccessToken();
      const organizationId = getOrganizationIdFromStorage();
     
      // Validam token-ul
      if (!token) {
        throw new Error("Access token was not found. Please sign in again.");
      }

      // Validam ID-ul organizatiei
      if (!organizationId) {
        throw new Error("Organization ID was not found. Please sign in again.");
      }

      // Facem doua requesturi in paralel
      const [statsData, organizationData] = await Promise.all([
        getDashboardStats(),
        getOrganizationById(organizationId),
      ]);

      // Salvam datele in state
      setStats(statsData);
      setOrganization(organizationData);

    } catch (error) {
      // Gestionam erorile intr-un mod user-friendly
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load the admin dashboard."
      );
    } finally {
      // Indiferent de rezultat, scoatem loading-ul
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  // ---------- LOADIN STATE ----------
  if (isLoading) {
    return (
      <div className="w-full px-6 py-10 space-y-10">
        {/* Skeleton pentru titlu */}
        <div className="space-y-2">
          <div className="h-8 w-56 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-80 animate-pulse rounded bg-white/5" />
        </div>

        {/* Skeleton pentru KPI Grid */}
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl bg-white/10"
            />
          ))}
        </div>

        {/* Skeleton pentru Summary + Quick Links */}
        <div className="grid gap-10 xl:grid-cols-[1.35fr_1fr]">
          <div className="h-[360px] animate-pulse rounded-2xl bg-white/10" />
          <div className="h-[360px] animate-pulse rounded-2xl bg-white/10" />
        </div>
      </div>
    );
  }

  // ---------- ERROR STATE ----------
  if (errorMessage) {
    return (
      <div className="w-full px-6 py-10 space-y-10">
        {/* Titlu */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-400">
            Overview of your organization, key metrics, and quick access to main admin areas.
          </p>
        </div>

        {/* Banner de eroare */}
        <AdminStatusBanner variant="error" message={errorMessage} />

        {/* Buton de retry */}
        <button
          onClick={loadDashboard}
          className="w-fit rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  // ---------- SAFETY CHECK - daca lipsesc datele, nu randam nimic ----------
  if (!stats || !organization) {
    return null;
  }

  // ---------- MAIN DASHBOARD UI
  return (
    <div className="w-full px-6 py-10 space-y-10">
      {/* Titlu */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-sm text-gray-400">
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
          onOrganizationUpdated={loadDashboard}
        />
        <AdminQuickLinks />
      </div>
    </div>
  );
}




