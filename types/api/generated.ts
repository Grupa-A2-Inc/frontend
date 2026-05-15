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

export type ChapterDtoResponse = {
  id?: Uuid;
  title?: string;
  orderIndex?: number;
};

export type ChapterDtoPost = {
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
  category?: string;
  status?: CourseStatus;
  visibility?: CourseVisibility;
  createdBy?: Uuid;
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

export type LessonDtoPost = {
  title?: string;
  contentMarkdown?: string;
};

export type LessonDtoMetadata = {
  title?: string;
  orderIndex?: number;
};

export type CreateLessonResourceDto = {
  title?: string;
  url?: string;
};

export type UpdateLessonResourceDto = CreateLessonResourceDto;

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

export type TestEditDto = {
  title?: string;
  description?: string;
  timeLimitSec?: number;
  aiEnabled?: boolean;
};

export type AiGenerateRequestDto = {
  count?: number;
};

export type AiGenerateResponseDto = {
  requestId?: Uuid;
  status?: "PENDING" | "SUCCESS" | "FAILED" | "FALLBACK";
  lessonId?: Uuid;
};

export type AiRequestStatusDto = {
  requestId?: Uuid;
  status?: "PENDING" | "SUCCESS" | "FAILED" | "FALLBACK";
};

export type InjectRequestDto = {
  testIdOpt?: Uuid;
};

export type InjectionResultDto = {
  testId?: Uuid;
  testCreated?: boolean;
  injectedCount?: number;
  newTotalQuestions?: number;
  lessonId?: Uuid;
};

export type QuestionType = "SINGLE_CHOICE" | "MULTI_CHOICE" | "TRUE_FALSE";

export type OptionRequestDto = {
  text?: string;
  displayOrder?: number;
  isCorrect?: boolean;
};

export type QuestionRequestDto = {
  questionType?: QuestionType;
  content?: string;
  difficulty?: number;
  options?: OptionRequestDto[];
};

export type OptionResponseDto = {
  optionId?: number;
  text?: string;
  displayOrder?: number;
  isCorrect?: boolean;
};

export type QuestionResponseDto = {
  questionId?: number;
  questionType?: QuestionType;
  content?: string;
  difficulty?: number;
  options?: OptionResponseDto[];
};

export type OptionForStudentDto = {
  optionId?: string | number;
  text?: string;
};

export type QuestionForStudentDto = {
  questionId?: number;
  questionType?: QuestionType;
  content?: string;
  difficulty?: number;
  options?: OptionForStudentDto[];
};

export type TestInfoForAttemptDto = {
  id?: Uuid;
  title?: string;
};

export type StartAttemptResponseDto = {
  attemptId?: Uuid;
  attemptNumber?: number;
  startedAt?: IsoDateTime;
  timeLimitSec?: number;
  test?: TestInfoForAttemptDto;
  questions?: QuestionForStudentDto[];
};

export type SubmitAnswerDto = {
  questionId?: number;
  selectedOptionIds?: number[];
  timeSpent?: number;
};

export type SubmitRequestDto = {
  answers?: SubmitAnswerDto[];
};

export type TestResultQuestionDto = {
  questionId?: number;
  questionType?: QuestionType;
  content?: string;
  selectedOptionIds?: number[];
  correctOptionIds?: number[];
  correct?: boolean;
};

export type TestResultDto = {
  attemptId?: Uuid;
  score?: number;
  scorePercent?: number;
  passed?: boolean;
  completedAt?: IsoDateTime;
  questions?: TestResultQuestionDto[];
};

export type QuestionForAttemptReportDTO = {
  questionId?: number;
  questionType?: QuestionType;
  content?: string;
  selectedOptionIds?: number[];
  correctOptionIds?: number[];
};

export type AttemptReportDTO = {
  attemptId?: Uuid;
  score?: number;
  scorePercent?: number;
  passed?: boolean;
  completedAt?: IsoDateTime;
  question?: QuestionForAttemptReportDTO[];
};

export type QuestionOptionsDataDto = {
  id?: number;
  text?: string;
  displayOrder?: number;
};

export type QuestionDataForUsersDto = {
  id?: number;
  subjectId?: number;
  topicId?: number;
  questionType?: QuestionType;
  content?: string;
  difficulty?: number;
  isActive?: boolean;
  options?: QuestionOptionsDataDto[];
  correctAnswers?: QuestionOptionsDataDto[];
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

export type LessonStatusDto = {
  lessonId?: Uuid;
  title?: string;
  visited?: boolean;
  visitedAt?: IsoDateTime;
};

export type ProgressWithLessonListDto = {
  totalLessons?: number;
  visitedLessons?: number;
  progressPercent?: number;
  completedAt?: IsoDateTime;
  lessons?: LessonStatusDto[];
};

export type DifficultyLessonDto = {
  lessonId?: Uuid;
  lessonTitle?: string;
  myBestScore?: number;
  classAverage?: number;
  gap?: number;
};

export type AttemptDetailsDto = {
  attemptId?: Uuid;
  testId?: Uuid;
  testTitle?: string;
  score?: number;
  scorePercent?: number;
  passed?: boolean;
  completedAt?: IsoDateTime;
};

export type MySummaryDataDto = {
  courseTitle?: string;
  totalTestCount?: number;
  totalTestDone?: number;
  totalTestPassed?: number;
  bestScore?: number;
  lowestScore?: number;
  averageScore?: number;
  difficultyLessons?: DifficultyLessonDto[];
  lastAttempts?: AttemptDetailsDto[];
};

export type AttemptStatusDTO = {
  attemptID?: Uuid;
  attemptNumber?: number;
  score?: number;
  scorePercent?: number;
  passed?: boolean;
  startedAt?: IsoDateTime;
  status?: "IN_PROGRESS" | "DONE" | "EXPIRED";
};

export type MyTestStatsDto = {
  testId?: Uuid;
  testTitle?: string;
  totalAttemptCount?: number;
  bestScore?: number;
  lowestScore?: number;
  averageScore?: number;
  lastScore?: number;
  totalStudentCount?: number;
  classAverage?: number;
  classMedian?: number;
  rank?: number;
  percentile?: number;
};

export type ClassAverageDto = {
  testId?: Uuid;
  testTitle?: string;
  totalAttempts?: number;
  passedCount?: number;
  failedCount?: number;
  averageScore?: number;
  minScore?: number;
  maxScore?: number;
  failureRate?: number;
};

export type FailureRateDTO = {
  failureRate?: number;
  threshold?: number;
  alertTriggered?: boolean;
};

export type FailureRateChartPointDTO = {
  date?: string;
  dailyFailureRate?: number;
};

export type TestFailureRateChartDTO = {
  failureRatePoints?: FailureRateChartPointDTO[];
};

export type ThresholdDTO = {
  failureThreshold?: number;
};

export type AlertDTO = {
  alertId?: Uuid;
  testId?: Uuid;
  professorId?: Uuid;
  failureThreshold?: number;
  currentFailureRate?: number;
  isActive?: boolean;
};

export type AdaptiveStartRequestDto = {
  subjectId?: number;
  topicId?: number;
  count?: number;
};

export type AnswerDto = {
  exerciseId?: string;
  givenAnswers?: string[];
  timeSpent?: number;
};

export type ClientExerciseDto = {
  exerciseId?: string;
  text?: string;
  type?: QuestionType;
  answers?: string[];
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
  mlExerciseId?: string;
  correct?: boolean;
  score?: number;
  correctAnswers?: string[];
  givenAnswers?: string[];
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

export type SubscriptionProvider = "STRIPE" | "MANUAL" | "INTERNAL";

export type OrganizationSubscriptionResponse = {
  id?: Uuid;
  organizationId?: Uuid;
  subscriptionPlanId?: Uuid;
  status?: "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED" | "EXPIRED";
  provider?: SubscriptionProvider;
  providerCustomerId?: string;
  providerSubscriptionId?: string;
  currentPeriodStart?: IsoDateTime;
  currentPeriodEnd?: IsoDateTime;
  createdAt?: IsoDateTime;
  updatedAt?: IsoDateTime;
};

export type CreateCheckoutSessionRequest = {
  planId: Uuid;
  successUrl: string;
  cancelUrl: string;
};

export type CheckoutSessionResponse = {
  checkoutUrl?: string;
  sessionId?: string;
};
