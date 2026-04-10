import {
  OrganizationProfile,
  UpdateOrganizationPayload,
} from "./types";

export function mapOrganizationResponse(data: any): OrganizationProfile {
  return {
    id: String(data?.id ?? ""),
    organizationName: String(data?.name ?? ""),
    organizationType: String(data?.organizationType ?? ""),
    country: String(data?.country ?? ""),
    city: String(data?.city ?? ""),
    address: String(data?.address ?? ""),
    phoneNumber: String(data?.phoneNumber ?? ""),
  };
}

export function mapUpdateOrganizationPayload(
  organization: OrganizationProfile
): UpdateOrganizationPayload {
  return {
    name: organization.organizationName.trim(),
    organizationType: organization.organizationType.trim(),
    country: organization.country.trim(),
    city: organization.city.trim(),
    address: organization.address.trim(),
    phoneNumber: organization.phoneNumber.trim(),
  };
}