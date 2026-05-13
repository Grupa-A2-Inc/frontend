import type {
  CreateOrganizationRequest,
  OrganizationResponse,
  UpdateOrganizationRequest,
} from "@/types/api/generated";

export type Organization = OrganizationResponse;
export type CreateOrganizationPayload = CreateOrganizationRequest;
export type UpdateOrganizationPayload = UpdateOrganizationRequest;

export type OrganizationProfile = {
  id: string;
  organizationName: string;
  organizationType: string;
  country: string;
  city: string;
  address: string;
  phoneNumber: string;
};

export type AdminDashboardStats = {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalCourses: number;
  warnings?: string[];
};
