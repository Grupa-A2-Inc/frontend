import { AdminDashboardStats } from "@/lib/admin-dashboard/types";
import AdminKpiCard from "./AdminKpiCard";

// Componenta AdminKpiGrid este responasbila doar pentru layout
export default function AdminKpiGrid({ stats }: { stats: AdminDashboardStats }) {
  if (!stats)
    return null;

  const hasMetrics =
    stats.totalStudents !== null ||
    stats.totalTeachers !== null ||
    stats.totalClasses !== null;

  if (!hasMetrics) return null;

  return (
    <div className="grid gap-4 grid-cols-2 xl:grid-cols-3">
      {stats.totalStudents !== null && (
        <AdminKpiCard
          label="Total Students"
          value={stats.totalStudents}
          helperText="Students in your organization."
        />
      )}

      {stats.totalTeachers !== null && (
        <AdminKpiCard
          label="Total Teachers"
          value={stats.totalTeachers}
          helperText="Teachers in your organization."
        />
      )}

      {stats.totalClasses !== null && (
        <AdminKpiCard
          label="Total Classes"
          value={stats.totalClasses}
          helperText="Classes in your organization."
        />
      )}
    </div>
  );
}
