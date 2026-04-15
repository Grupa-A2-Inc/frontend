export type AdminDashboardStats = {
    totalStudents : number;
    totalTeachers : number;
    totalClasses : number;
    totalCourses : number;

    warnings?: string[];
};

export type OrganizationProfile = {
    id : string;
    organizationName : string;
    organizationType : string;
    country : string;
    city : string;
    address : string;
    phoneNumber : string;

};

export type UpdateOrganizationPayload = {
    name : string;
    organizationType : string;
    country : string;
    city : string;
    address : string;
    phoneNumber : string;
};

export type StoredUser = {
   id? : string;
   firstName? : string;
   lastName? : string;
   email?: string;
   role?: string;
   organizationId?: string;
   organizationName?: string;
   organizationType?: string;
   country?: string;
   city?: string;
   organizationPhoneNumber?: string;
   organizationAddress?: string;
};