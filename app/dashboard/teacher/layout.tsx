import { requireDashboardAccess } from "@/lib/auth/dashboardAccess";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardAccess("teacher");

  return children;
}
