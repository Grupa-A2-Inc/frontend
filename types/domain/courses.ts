import type {
  CreateCourseDto,
  CourseStatus,
  CourseVisibility,
  EnrolledCourseDto,
  LessonDtoEntity,
  PageStudentAverageDto,
  PageStudentProgressDto,
  PageEnrolledCourseDto,
  PageResponseCourseDto,
  ResponseCourseDto,
  ResponseCourseFullViewDto,
  ResponseLessonResourceDto,
  StudentAverageDto,
  StudentProgressDto,
  TestEntityDto,
  UpdateCourseDto,
} from "@/types/api/generated";
import type { Page } from "@/types/api/pagination";

export type { CourseStatus, CourseVisibility };

export type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: CourseStatus;
  visibility: CourseVisibility;
  createdBy?: string;
  createdAt?: string;
};

export type LessonResource = {
  id: string;
  lessonId?: string;
  title: string;
  url: string;
  type?: string;
};

export type Lesson = {
  id: string;
  chapterId?: string;
  testId?: string;
  title: string;
  contentMarkdown: string;
  orderIndex: number;
  lessonResources: LessonResource[];
};

export type Chapter = {
  id: string;
  courseId?: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
};

export type CourseFullView = Course & {
  chapters: Chapter[];
};

export type CourseTest = {
  id: string;
  lessonId?: string;
  title: string;
  description?: string;
  timeLimitSec?: number;
  status: CourseStatus;
  aiEnabled: boolean;
  createdAt?: string;
};

export type EnrolledCourse = EnrolledCourseDto;
export type CoursesPage = PageResponseCourseDto;
export type EnrolledCoursesPage = PageEnrolledCourseDto;
export type CreateCoursePayload = CreateCourseDto & { teacherId?: string };
export type UpdateCoursePayload = UpdateCourseDto;
export type CourseListResponse = ResponseCourseDto[] | PageResponseCourseDto;
export type PublicCoursesPage = PageResponseCourseDto;
export type StudentProgress = Required<Pick<StudentProgressDto, "studentId">> &
  Omit<StudentProgressDto, "studentId">;
export type StudentProgressPage = PageStudentProgressDto;
export type StudentAverage = Required<Pick<StudentAverageDto, "studentId">> &
  Omit<StudentAverageDto, "studentId">;
export type StudentAveragePage = PageStudentAverageDto;

export type StudentCourse = Course & {
  enrollmentId?: string;
  enrolledAt?: string;
  progressPercent?: number;
  completedAt?: string;
};

export type PaginatedCourses = Page<StudentCourse>;
export type CoursePaginationMeta = Omit<PaginatedCourses, "content">;

export type EnrolledStudent = {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  classId: string;
  className: string;
  progressPercent: number;
  averageScore?: number;
  passedTests?: number;
  failedTests?: number;
};

export type ClassWithStudents = {
  classId: string;
  className: string;
  students: EnrolledStudent[];
};

export type CourseSortField = "name" | "averageScore" | "progressPercent" | "passedTests";
export type CourseSortDirection = "asc" | "desc";

export type LessonEntity = LessonDtoEntity;
export type RawCourseFullView = ResponseCourseFullViewDto;
export type RawLessonResource = ResponseLessonResourceDto;
export type RawCourseTest = TestEntityDto;
