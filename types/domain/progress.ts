import type {
  EnrolledCourseDto,
  LessonStatusDto,
  ProgressWithLessonListDto,
  StudentProgressDto,
} from "@/types/api/generated";

export type LessonProgress = LessonStatusDto;
export type CourseProgress = ProgressWithLessonListDto;
export type StudentCourseProgress = EnrolledCourseDto;
export type StudentProgressRecord = StudentProgressDto;

export type MyCourseProgressOverview = {
  courseId: string;
  courseTitle: string;
  courseCategory?: string;
  enrolledAt?: string;
  progressPercent: number;
  completedAt?: string;
  totalLessons: number;
  visitedLessons: number;
  lessons: LessonProgress[];
};
