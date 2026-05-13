import { baseApi } from "@/store/api/baseApi";
import type {
  ApiUserRole,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserStatusRequest,
  UserResponse,
} from "@/types/api/generated";
import type { User, UserRole } from "@/types/domain/users";

type UsersResponseEnvelope = {
  content?: UserResponse[];
  users?: UserResponse[];
  items?: UserResponse[];
  data?: UserResponse[];
};

type UpdateUserArgs = {
  userId: string;
  data: UpdateUserRequest;
};

type UpdateUserStatusArgs = {
  userId: string;
  data: UpdateUserStatusRequest;
};

function normalizeRole(role: ApiUserRole | string | undefined): UserRole {
  if (role === "ORGANIZATION_ADMIN" || role === "TEACHER" || role === "STUDENT") {
    return role;
  }

  return "STUDENT";
}

export function normalizeUserResponse(user: UserResponse): User {
  return {
    id: user.id ?? "",
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
    role: normalizeRole(user.roleName),
    status: user.status ?? "PENDING",
    organizationId: user.organizationId,
  };
}

function normalizeUsersResponse(response: UserResponse[] | UsersResponseEnvelope): User[] {
  const list = Array.isArray(response)
    ? response
    : response.content ?? response.users ?? response.items ?? response.data ?? [];

  return list.map(normalizeUserResponse).filter((user) => user.id);
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => "/api/v1/users",
      transformResponse: normalizeUsersResponse,
      providesTags: (result) =>
        result
          ? [
              ...result.map((user) => ({ type: "User" as const, id: user.id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),
    getOrganizationUsers: builder.query<User[], void>({
      query: () => "/api/v1/users/organization",
      transformResponse: normalizeUsersResponse,
      providesTags: (result) =>
        result
          ? [
              ...result.map((user) => ({ type: "User" as const, id: user.id })),
              { type: "User", id: "ORGANIZATION_LIST" },
            ]
          : [{ type: "User", id: "ORGANIZATION_LIST" }],
    }),
    createUser: builder.mutation<UserResponse, CreateUserRequest>({
      query: (body) => ({
        url: "/api/v1/users",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "User", id: "LIST" },
        { type: "User", id: "ORGANIZATION_LIST" },
      ],
    }),
    updateUser: builder.mutation<UserResponse | void, UpdateUserArgs>({
      query: ({ userId, data }) => ({
        url: `/api/v1/users/${userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "User", id: userId },
        { type: "User", id: "LIST" },
        { type: "User", id: "ORGANIZATION_LIST" },
      ],
    }),
    updateUserStatus: builder.mutation<void, UpdateUserStatusArgs>({
      query: ({ userId, data }) => ({
        url: `/api/v1/users/${userId}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "User", id: userId },
        { type: "User", id: "LIST" },
        { type: "User", id: "ORGANIZATION_LIST" },
      ],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/api/v1/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, userId) => [
        { type: "User", id: userId },
        { type: "User", id: "LIST" },
        { type: "User", id: "ORGANIZATION_LIST" },
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetOrganizationUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
} = usersApi;

