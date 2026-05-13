import { baseApi } from "@/store/api/baseApi";
import type {
  ClassroomCourseDetailsResponse,
  ClassroomMemberResponse,
  ClassroomResponse,
  AssignCoursesToClassroomRequest,
  CreateClassroomRequest,
  ModifyClassroomMembersRequest,
  UpdateClassroomRequest,
} from "@/types/api/generated";
import type {
  ClassroomDetails,
  ClassroomMember,
} from "@/types/domain/classrooms";

type CollectionEnvelope<T> = {
  content?: T[];
  classrooms?: T[];
  members?: T[];
  items?: T[];
  data?: T[];
};

type UpdateClassroomArgs = {
  classroomId: string;
  data: UpdateClassroomRequest;
};

type ModifyMembersArgs = {
  classroomId: string;
  data: ModifyClassroomMembersRequest;
};

type AssignCoursesArgs = {
  classroomId: string;
  data: AssignCoursesToClassroomRequest;
};

function normalizeCollection<T>(response: T[] | CollectionEnvelope<T>): T[] {
  return Array.isArray(response)
    ? response
    : response.content ?? response.classrooms ?? response.members ?? response.items ?? response.data ?? [];
}

export function normalizeClassroomResponse(classroom: ClassroomResponse): ClassroomDetails {
  return {
    id: classroom.id ?? "",
    organizationId: classroom.organizationId,
    name: classroom.name ?? "",
    description: classroom.description ?? "",
    createdAt: classroom.createdAt,
    updatedAt: classroom.updatedAt,
  };
}

export function normalizeClassroomMemberResponse(member: ClassroomMemberResponse): ClassroomMember {
  return {
    userId: member.userId ?? "",
    email: member.email ?? "",
    membershipType: member.membershipType ?? "STUDENT",
  };
}

export const classroomsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClassrooms: builder.query<ClassroomDetails[], void>({
      query: () => "/api/v1/classrooms",
      transformResponse: (response: ClassroomResponse[] | CollectionEnvelope<ClassroomResponse>) =>
        normalizeCollection(response).map(normalizeClassroomResponse).filter((classroom) => classroom.id),
      providesTags: (result) =>
        result
          ? [
              ...result.map((classroom) => ({ type: "Classroom" as const, id: classroom.id })),
              { type: "Classroom", id: "LIST" },
            ]
          : [{ type: "Classroom", id: "LIST" }],
    }),
    getClassroomById: builder.query<ClassroomDetails, string>({
      query: (classroomId) => `/api/v1/classrooms/${classroomId}`,
      transformResponse: normalizeClassroomResponse,
      providesTags: (_result, _error, classroomId) => [
        { type: "Classroom", id: classroomId },
      ],
    }),
    createClassroom: builder.mutation<ClassroomDetails, CreateClassroomRequest>({
      query: (body) => ({
        url: "/api/v1/classrooms",
        method: "POST",
        body,
      }),
      transformResponse: normalizeClassroomResponse,
      invalidatesTags: [{ type: "Classroom", id: "LIST" }],
    }),
    updateClassroom: builder.mutation<ClassroomDetails | void, UpdateClassroomArgs>({
      query: ({ classroomId, data }) => ({
        url: `/api/v1/classrooms/${classroomId}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: ClassroomResponse | undefined) =>
        response ? normalizeClassroomResponse(response) : undefined,
      invalidatesTags: (_result, _error, { classroomId }) => [
        { type: "Classroom", id: classroomId },
        { type: "Classroom", id: "LIST" },
      ],
    }),
    deleteClassroom: builder.mutation<void, string>({
      query: (classroomId) => ({
        url: `/api/v1/classrooms/${classroomId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, classroomId) => [
        { type: "Classroom", id: classroomId },
        { type: "Classroom", id: "LIST" },
      ],
    }),
    listClassroomMembers: builder.query<ClassroomMember[], string>({
      query: (classroomId) => `/api/v1/classrooms/${classroomId}/members`,
      transformResponse: (response: ClassroomMemberResponse[] | CollectionEnvelope<ClassroomMemberResponse>) =>
        normalizeCollection(response)
          .map(normalizeClassroomMemberResponse)
          .filter((member) => member.userId),
      providesTags: (_result, _error, classroomId) => [
        { type: "Classroom", id: `${classroomId}:members` },
      ],
    }),
    addClassroomMembers: builder.mutation<void, ModifyMembersArgs>({
      query: ({ classroomId, data }) => ({
        url: `/api/v1/classrooms/${classroomId}/members`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { classroomId }) => [
        { type: "Classroom", id: `${classroomId}:members` },
      ],
    }),
    deleteClassroomMembers: builder.mutation<void, ModifyMembersArgs>({
      query: ({ classroomId, data }) => ({
        url: `/api/v1/classrooms/${classroomId}/members`,
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: (_result, _error, { classroomId }) => [
        { type: "Classroom", id: `${classroomId}:members` },
      ],
    }),
    getClassroomCourses: builder.query<ClassroomCourseDetailsResponse[], string>({
      query: (classroomId) => `/api/v1/classrooms/${classroomId}/courses`,
      transformResponse: (response: ClassroomCourseDetailsResponse[] | CollectionEnvelope<ClassroomCourseDetailsResponse>) =>
        normalizeCollection(response),
      providesTags: (_result, _error, classroomId) => [
        { type: "Classroom", id: `${classroomId}:courses` },
      ],
    }),
    assignCoursesToClassroom: builder.mutation<void, AssignCoursesArgs>({
      query: ({ classroomId, data }) => ({
        url: `/api/v1/classrooms/${classroomId}/courses`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { classroomId }) => [
        { type: "Classroom", id: `${classroomId}:courses` },
        { type: "Course", id: "ENROLLED_LIST" },
      ],
    }),
  }),
});

export const {
  useGetClassroomsQuery,
  useGetClassroomByIdQuery,
  useCreateClassroomMutation,
  useUpdateClassroomMutation,
  useDeleteClassroomMutation,
  useListClassroomMembersQuery,
  useAddClassroomMembersMutation,
  useDeleteClassroomMembersMutation,
  useGetClassroomCoursesQuery,
  useAssignCoursesToClassroomMutation,
} = classroomsApi;
