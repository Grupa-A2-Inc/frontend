import type { UserRole } from "@/store/slices/authSlice";

export function getDashboardPathForRole(role: UserRole): string {
  if (role === "ORGANIZATION_ADMIN") return "/dashboard/admin";
  if (role === "TEACHER") return "/dashboard/teacher";
  return "/dashboard/student";
}

export function normalizeUserRole(role: string | undefined): UserRole {
  if (role === "ORGANIZATION_ADMIN" || role === "TEACHER" || role === "STUDENT") {
    return role;
  }

  return "STUDENT";
}

