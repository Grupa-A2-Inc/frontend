import { baseApi } from "@/store/api/baseApi";
import type {
  OrganizationResponse,
  UpdateOrganizationRequest,
} from "@/types/api/generated";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { ApiError } from "@/types/api/errors";
import type {
  AdminDashboardStats,
  OrganizationProfile,
} from "@/types/domain/organizations";
import type { User } from "@/types/domain/users";
import type { ClassroomDetails } from "@/types/domain/classrooms";
import type { Course } from "@/types/domain/courses";
import { usersApi } from "@/store/api/usersApi";
import { classroomsApi } from "@/store/api/classroomsApi";
import { coursesApi } from "@/store/api/coursesApi";

type UpdateOrganizationArgs = {
  organizationId: string;
  data: UpdateOrganizationRequest;
};

export function mapOrganizationProfile(data: OrganizationResponse): OrganizationProfile {
  return {
    id: String(data.id ?? ""),
    organizationName: String(data.name ?? ""),
    organizationType: String(data.organizationType ?? ""),
    country: String(data.country ?? ""),
    city: String(data.city ?? ""),
    address: String(data.address ?? ""),
    phoneNumber: String(data.phoneNumber ?? ""),
  };
}

function buildDashboardStats(
  users: User[],
  classrooms: ClassroomDetails[],
  courses: Course[],
): AdminDashboardStats {
  return {
    totalStudents: users.filter((user) => user.role === "STUDENT").length,
    totalTeachers: users.filter((user) => user.role === "TEACHER").length,
    totalClasses: classrooms.length,
    totalCourses: courses.length,
    warnings: [],
  };
}

export const organizationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizationById: builder.query<OrganizationProfile, string>({
      query: (organizationId) => `/api/v1/organizations/${organizationId}`,
      transformResponse: mapOrganizationProfile,
      providesTags: (_result, _error, organizationId) => [
        { type: "Organization", id: organizationId },
      ],
    }),
    updateOrganization: builder.mutation<void, UpdateOrganizationArgs>({
      query: ({ organizationId, data }) => ({
        url: `/api/v1/organizations/${organizationId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { organizationId }) => [
        { type: "Organization", id: organizationId },
      ],
    }),
    getAdminDashboardStats: builder.query<AdminDashboardStats, void>({
      async queryFn(_arg, api) {
        try {
          const [usersResult, classroomsResult, coursesResult] = await Promise.all([
            api.dispatch(
              usersApi.endpoints.getOrganizationUsers.initiate(undefined, {
                subscribe: false,
              }),
            ).unwrap(),
            api.dispatch(
              classroomsApi.endpoints.getClassrooms.initiate(undefined, {
                subscribe: false,
              }),
            ).unwrap(),
            api.dispatch(
              coursesApi.endpoints.getMyCourses.initiate(undefined, {
                subscribe: false,
              }),
            ).unwrap(),
          ]);

          return {
            data: buildDashboardStats(usersResult, classroomsResult, coursesResult),
          };
        } catch (error) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              message: getApiErrorMessage(error),
              details: error,
            } satisfies ApiError,
          };
        }
      },
      providesTags: [
        { type: "User", id: "ORGANIZATION_LIST" },
        { type: "Classroom", id: "LIST" },
        { type: "Analytics", id: "ADMIN_DASHBOARD" },
      ],
    }),
  }),
});

export const {
  useGetOrganizationByIdQuery,
  useUpdateOrganizationMutation,
  useGetAdminDashboardStatsQuery,
} = organizationsApi;
