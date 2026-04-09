import { AdminDashboardStats } from "@/lib/admin-dashboard/types";
import AdminKpiCard from "./AdminKpiCard";

type Props = {
  stats: AdminDashboardStats;
};

export default function AdminKpiGrid({ stats }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
      <AdminKpiCard
        label="Total Students"
        value={stats.totalStudents}
        helperText="Awaiting backend statistics integration"
      />
      <AdminKpiCard
        label="Total Teachers"
        value={stats.totalTeachers}
        helperText="Awaiting backend statistics integration"
      />
      <AdminKpiCard
        label="Total Classes"
        value={stats.totalClasses}
        helperText="Awaiting backend statistics integration"
      />
      <AdminKpiCard
        label="Total Courses"
        value={stats.totalCourses}
        helperText="Awaiting backend statistics integration"
      />
    </div>
  );
}