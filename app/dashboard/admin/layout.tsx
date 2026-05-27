import { requireDashboardAccess } from "@/lib/auth/dashboardAccess";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardAccess("admin");

  return children;
}
