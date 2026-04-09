import {
    AdminDashboardStats,
    OrganizationProfile,
    UpdateOrganizationPayload,
} from "./types";

export function mapOrganizationResponse(data : any): OrganizationProfile {
    return {
        id : String(data?.id ?? ""),
        organizationName : data?.name ?? "",
        organizationType : data?.organizationType ?? "",
        country : data?.country ?? "",
        city: data?.city ?? "",
        address: data?.address ?? "",
        phoneNumber: data?.phoneNumber ?? "",
    };
}

export function mapUpdateOrganizationPayload(organization : OrganizationProfile):
UpdateOrganizationPayload {
    return {
        name : organization.organizationName,
        organizationType: organization.organizationType,
        country: organization.country,
        city: organization.city,
        address: organization.address ?? "",
        phoneNumber: organization.phoneNumber ?? "",
    };
}
export function mapFallbackStats(): AdminDashboardStats {
    return {
        totalStudents : 0, 
        totalteachers : 0,
        totalClasses : 0,
        totalCourses : 0,
    };
}
