import type {
  AssignCoursesToClassroomRequest,
  ClassroomCourseDetailsResponse,
  ClassroomMemberResponse,
  ClassroomResponse,
  CreateClassroomRequest,
  ModifyClassroomMembersRequest,
  UpdateClassroomRequest,
} from "@/types/api/generated";

export type Classroom = ClassroomResponse;
export type ClassroomDetails = Required<Pick<ClassroomResponse, "id" | "name" | "description">> &
  Omit<ClassroomResponse, "id" | "name" | "description">;
export type ClassroomMember = Required<Pick<ClassroomMemberResponse, "userId" | "email" | "membershipType">>;
export type ClassroomCourseDetails = ClassroomCourseDetailsResponse;
export type CreateClassroomPayload = CreateClassroomRequest;
export type UpdateClassroomPayload = UpdateClassroomRequest;
export type ModifyClassroomMembersPayload = ModifyClassroomMembersRequest;
export type AssignCoursesToClassroomPayload = AssignCoursesToClassroomRequest;
