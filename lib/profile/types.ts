import { Organization, User, UserRole, UserStatus } from "@/store/slices/authSlice";

export type BackendUserResponse = {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  roleName?: UserRole;
  status?: UserStatus;
  organizationId?: string;
};

export type BackendOrganizationResponse = {
  id?: string;
  name?: string;
  country?: string;
  city?: string;
  organizationType?: string;
  type?: string;
  address?: string | null;
  phoneNumber?: string | null;
};

export type UpdateProfilePayload = {
  firstName: string;
  lastName: string;
  email: string;
  organizationId?: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
};

export type UpdateOrganizationPayload = {
  name: string;
  organizationType: string;
  country: string;
  city: string;
  address: string;
  phoneNumber: string;
};

export function mapOrganizationResponse(
  data: BackendOrganizationResponse | null | undefined,
  fallback?: User | null
): Organization | null {
  const id = data?.id ?? fallback?.organizationId;
  if (!id) return null;

  return {
    id,
    name: data?.name ?? fallback?.organizationName ?? "",
    type: data?.organizationType ?? data?.type ?? fallback?.organizationType ?? "",
    country: data?.country ?? fallback?.country ?? "",
    city: data?.city ?? fallback?.city ?? "",
    phoneNumber: data ? data.phoneNumber ?? "" : fallback?.organizationPhoneNumber ?? "",
    address: data ? data.address ?? "" : fallback?.organizationAddress ?? "",
  };
}

export function mergeUserProfile(
  data: BackendUserResponse,
  fallback: User,
  organization?: Organization | null
): User {
  const organizationId = data.organizationId ?? organization?.id ?? fallback.organizationId;

  return {
    id: data.id ?? fallback.id,
    email: data.email ?? fallback.email,
    firstName: data.firstName ?? fallback.firstName,
    lastName: data.lastName ?? fallback.lastName,
    role: data.roleName ?? data.role ?? fallback.role,
    status: data.status ?? fallback.status,
    organizationId,
    organizationName: organization?.name ?? fallback.organizationName,
    organizationType: organization?.type ?? fallback.organizationType,
    country: organization?.country ?? fallback.country,
    city: organization?.city ?? fallback.city,
    organizationPhoneNumber: organization?.phoneNumber ?? fallback.organizationPhoneNumber,
    organizationAddress: organization?.address ?? fallback.organizationAddress,
  };
}
