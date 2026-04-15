import { AdminDashboardStats } from "@/lib/admin-dashboard/types";
import AdminKpiCard from "./AdminKpiCard";

// Componenta AdminKpiGrid este responasbila doar pentru layout
export default function AdminKpiGrid({ stats }: { stats: AdminDashboardStats }) {
  if (!stats) 
    return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
      <AdminKpiCard
        label="Total Students"
        value={stats.totalStudents}
        helperText="Awaiting backend statistics integration"
      />
      <AdminKpiCard
  label="Total Students"
  value={stats.totalStudents}
  helperText="Calculated from the current users list."
/>
<AdminKpiCard
  label="Total Teachers"
  value={stats.totalTeachers}
  helperText="Calculated from the current users list."
/>
<AdminKpiCard
  label="Total Classes"
  value={stats.totalClasses}
  helperText="Pending backend support."
/>
<AdminKpiCard
  label="Total Courses"
  value={stats.totalCourses}
  helperText="Based on currently available courses endpoint."
/>
    </div>
  );
}