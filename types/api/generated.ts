import type { IsoDateTime, Uuid } from "./common";
import type { Page } from "./pagination";

export type ApiUserRole =
  | "ADMIN"
  | "ORGANIZATION_ADMIN"
  | "TEACHER"
  | "STUDENT"
  | "PARENT";

export type ApiUserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED" | "PENDING";

export type CourseStatus = "DRAFT" | "PUBLISHED";
export type CourseVisibility = "PRIVATE" | "PUBLIC";

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  organizationName?: string;
  country?: string;
  city?: string;
  organizationType?: string;
  address?: string;
  phoneNumber?: string;
};

export type UserDataResponse = {
  id?: Uuid;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: ApiUserRole;
  roleName?: ApiUserRole;
  status?: ApiUserStatus;
  organizationId?: Uuid;
  organizationName?: string;
  organizationType?: string;
  country?: string;
  city?: string;
  organizationPhoneNumber?: string;
  organizationAddress?: string;
};

export type AuthResponse = {
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: UserDataResponse;
};

export type RefreshResponse = {
  accessToken?: string;
  refreshToken?: string;
};

export type SetPasswordRequest = {
  token: string;
  password: string;
  confirmPassword: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  token: string;
  newPassword: string;
  confirmPassword: string;
};

export type UserResponse = {
  id?: Uuid;
  email?: string;
  firstName?: string;
  lastName?: string;
  roleName?: ApiUserRole;
  organizationId?: Uuid;
  status?: ApiUserStatus;
};

export type CreateUserRequest = {
  email: string;
  firstName: string;
  lastName: string;
  roleName: ApiUserRole;
  organizationId?: Uuid;
};

export type UpdateUserRequest = {
  email?: string;
  firstName?: string;
  lastName?: string;
  organizationId?: Uuid;
};

export type UpdateUserStatusRequest = {
  status: ApiUserStatus;
};

export type OrganizationResponse = {
  id?: Uuid;
  name?: string;
  country?: string;
  city?: string;
  organizationType?: string;
  address?: string;
  phoneNumber?: string;
  ownerId?: Uuid;
  ownerEmail?: string;
};

export type CreateOrganizationRequest = {
  name?: string;
  country?: string;
  city?: string;
  organizationType?: string;
  address?: string;
  phoneNumber?: string;
};

export type UpdateOrganizationRequest = CreateOrganizationRequest;

export type ClassroomResponse = {
  id?: Uuid;
  organizationId?: Uuid;
  name?: string;
  description?: string;
  createdAt?: IsoDateTime;
  updatedAt?: IsoDateTime;
};

export type CreateClassroomRequest = {
  name: string;
  description?: string;
};

export type UpdateClassroomRequest = {
  name?: string;
  description?: string;
};

export type ModifyClassroomMembersRequest = {
  memberIds: Uuid[];
};

export type ClassroomMemberResponse = {
  userId?: Uuid;
  firstName?: string;
  lastName?: string;
  email?: string;
  membershipType?: "TEACHER" | "STUDENT";
};

export type AssignCoursesToClassroomRequest = {
  courseIds: Uuid[];
};

export type ResponseCourseDto = {
  id?: Uuid;
  title?: string;
  description?: string;
  category?: string;
  status?: CourseStatus;
  visibility?: CourseVisibility;
  createdBy?: Uuid;
};

export type PageResponseCourseDto = Page<ResponseCourseDto>;

export type CreateCourseDto = {
  title?: string;
  description?: string;
  category?: string;
  status?: CourseStatus;
  chapters?: CreateChapterDTO[];
};

export type UpdateCourseDto = {
  title?: string;
  description?: string;
  category?: string;
  status?: CourseStatus;
};

export type CreateChapterDTO = {
  title?: string;
  orderIndex?: number;
};

export type ClassroomCourseDetailsResponse = {
  courseId?: Uuid;
  title?: string;
  description?: string;
  category?: string;
  status?: CourseStatus;
  visibility?: CourseVisibility;
  createdBy?: Uuid;
  assignedAt?: IsoDateTime;
};

export type EnrolledCourseDto = {
  enrollmentId?: Uuid;
  unrollmentId?: Uuid;
  courseId?: Uuid;
  courseTitle?: string;
  courseCategory?: string;
  enrolledAt?: IsoDateTime;
  progressPercent?: number;
  completedAt?: IsoDateTime;
};

export type PageEnrolledCourseDto = Page<EnrolledCourseDto>;

export type ResponseCourseFullViewDto = {
  id?: Uuid;
  title?: string;
  description?: string;
  status?: CourseStatus;
  visibility?: CourseVisibility;
  createdAt?: IsoDateTime;
  chapters?: ChapterFullViewDTO[];
};

export type ChapterFullViewDTO = {
  id?: Uuid;
  courseId?: Uuid;
  title?: string;
  description?: string;
  orderIndex?: number;
  lessons?: LessonFullViewDTO[];
};

export type LessonFullViewDTO = {
  id?: Uuid;
  chapterId?: Uuid;
  title?: string;
  contentMarkdown?: string;
  orderIndex?: number;
  lessonResources?: ResponseLessonResourceDto[];
  testId?: Uuid;
};

export type ResponseLessonResourceDto = {
  id?: Uuid;
  lessonId?: Uuid;
  title?: string;
  url?: string;
  type?: string;
};

export type LessonDtoEntity = {
  id?: Uuid;
  chapterID?: Uuid;
  chapterId?: Uuid;
  title?: string;
  contentMarkdown?: string;
  orderIndex?: number;
  createdAt?: IsoDateTime;
  updatedAt?: IsoDateTime;
};

export type TestEntityDto = {
  id?: Uuid;
  lessonId?: Uuid;
  createdBy?: Uuid;
  title?: string;
  description?: string;
  timeLimitSec?: number;
  status?: CourseStatus;
  aiEnabled?: boolean;
  createdAt?: IsoDateTime;
  updatedAt?: IsoDateTime;
};

export type StudentProgressDto = {
  studentId?: Uuid;
  enrolledAt?: IsoDateTime;
  progressPercent?: number;
  completedAt?: IsoDateTime;
};

export type PageStudentProgressDto = Page<StudentProgressDto>;

export type StudentAverageDto = {
  studentId?: Uuid;
  averageScore?: number;
  minScore?: number;
  maxScore?: number;
  testCount?: number;
  passedTests?: number;
  failedTests?: number;
  lastAttemptAt?: IsoDateTime;
};

export type PageStudentAverageDto = Page<StudentAverageDto>;

export type AdaptiveStartRequestDto = {
  subjectId?: number;
  topicId?: number;
  count?: number;
};

export type AnswerDto = {
  exerciseId?: string;
  selectedOptionId?: string;
};

export type ClientExerciseDto = {
  exerciseId?: string;
  question?: string;
  options?: OptionForStudentDto[];
};

export type OptionForStudentDto = {
  optionId?: string;
  text?: string;
};

export type AdaptiveStartDto = {
  sessionId?: Uuid;
  expiresAt?: IsoDateTime;
  exercises?: ClientExerciseDto[];
};

export type AdaptiveSubmitRequestDto = {
  answers?: AnswerDto[];
};

export type ClientResultDto = {
  exerciseId?: string;
  correct?: boolean;
  score?: number;
  explanation?: string;
};

export type AdaptiveResultDto = {
  sessionId?: Uuid;
  totalScore?: number;
  clientResults?: ClientResultDto[];
  feedbackSent?: boolean;
};

export type SubscriptionPlanResponse = {
  id?: Uuid;
  code?: string;
  displayName?: string;
  maxUsers?: number;
  maxClassrooms?: number;
  maxCourses?: number;
  hasPremiumFeatures?: boolean;
  priceMonthly?: number;
  currency?: string;
  createdAt?: IsoDateTime;
  updatedAt?: IsoDateTime;
};

export type OrganizationSubscriptionStatusResponse = {
  organizationId?: Uuid;
  status?: "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED" | "EXPIRED";
  currentPeriodStart?: IsoDateTime;
  currentPeriodEnd?: IsoDateTime;
  plan?: SubscriptionPlanResponse;
};
