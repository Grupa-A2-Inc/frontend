import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type DashboardArea = "admin" | "teacher" | "student";
type DashboardRole = "ADMIN" | "ORGANIZATION_ADMIN" | "TEACHER" | "STUDENT";

const allowedRoles: Record<DashboardArea, DashboardRole[]> = {
  admin: ["ADMIN", "ORGANIZATION_ADMIN"],
  teacher: ["TEACHER"],
  student: ["STUDENT"],
};

const roleDashboard: Record<DashboardRole, string> = {
  ADMIN: "/dashboard/admin",
  ORGANIZATION_ADMIN: "/dashboard/admin",
  TEACHER: "/dashboard/teacher",
  STUDENT: "/dashboard/student",
};

function isDashboardRole(role: string | undefined): role is DashboardRole {
  return Boolean(role && role in roleDashboard);
}

export async function requireDashboardAccess(area: DashboardArea): Promise<void> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const role = cookieStore.get("role")?.value;

  if (!accessToken || !isDashboardRole(role)) {
    redirect("/login");
  }

  if (!allowedRoles[area].includes(role)) {
    redirect(roleDashboard[role]);
  }
}
