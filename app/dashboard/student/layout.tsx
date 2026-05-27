import { requireDashboardAccess } from "@/lib/auth/dashboardAccess";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardAccess("student");

  return children;
}
