import type { UserRole } from "@/types/domain/auth";

export type NavigationItem = {
  label: string;
  href: string;
  icon?: string;
  roles?: UserRole[];
};

