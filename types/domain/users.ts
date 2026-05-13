import type {
  ApiUserRole,
  ApiUserStatus,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserStatusRequest,
} from "@/types/api/generated";

export type UserRole = Extract<ApiUserRole, "ORGANIZATION_ADMIN" | "TEACHER" | "STUDENT">;
export type UserStatus = ApiUserStatus;

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  organizationId?: string;
};

export type CreateUserPayload = CreateUserRequest;
export type UpdateUserPayload = UpdateUserRequest;
export type UpdateUserStatusPayload = UpdateUserStatusRequest;

export type UserFilters = {
  search?: string;
  role?: User["role"] | "ALL";
  status?: User["status"] | "ALL";
};
