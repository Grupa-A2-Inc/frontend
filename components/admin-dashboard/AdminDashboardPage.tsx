"use client";

import { useEffect, useState } from "react";
import { AdminDashboardStats, OrganizationProfile } from "@/lib/admin-dashboard/types";
import {
  getDashboardStats,
  getOrganizationById,
  getOrganizationIdFromStorage,
} from "@/lib/admin-dashboard/api";
import AdminKpiGrid from "./AdminKpiGrid";
import OrganizationSummaryCard from "./OrganizationSummaryCard";
import AdminQuickLinks from "./AdminQuickLinks";
import AdminStatusBanner from "./AdminStatusBanner";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [organization, setOrganization] = useState<OrganizationProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadDashboard() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const organizationId = getOrganizationIdFromStorage();

      if (!organizationId) {
        throw new Error(
          "Organization ID was not found. Please sign in again."
        );
      }

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
          : "Failed to load the admin dashboard."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <div className="h-8 w-56 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-80 animate-pulse rounded bg-gray-100" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl bg-gray-200"
            />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
          <div className="h-[360px] animate-pulse rounded-2xl bg-gray-200" />
          <div className="h-[360px] animate-pulse rounded-2xl bg-gray-200" />
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Overview of your organization, key metrics, and quick access to main admin areas.
          </p>
        </div>

        <AdminStatusBanner variant="error" message={errorMessage} />

        <button
          onClick={loadDashboard}
          className="w-fit rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
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
    <div className="space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Overview of your organization, key metrics, and quick access to main admin areas.
        </p>
      </div>

      <AdminKpiGrid stats={stats} />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <OrganizationSummaryCard
          organization={organization}
          onOrganizationUpdated={loadDashboard}
        />
        <AdminQuickLinks />
      </div>
    </div>
  );
}