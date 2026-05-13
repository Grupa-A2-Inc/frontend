export interface EnrolledCourseDto {
  unrollmentId: string;
  courseId: string;
  courseTitle: string;
  courseCategory: string;
  enrolledAt: string;
  progressPercent: number;
  completedAt: string | null;
}

export interface DifficultyLessonDto {
  lessonId: string;
  lessonTitle: string;
  studentScore: number;
  classAverage: number;
  difficultyGap: number;
}

export interface LastAttemptDto {
  testId: string;
  testTitle: string;
  score: number;
  passed: boolean;
  attemptedAt: string;
}

export interface CourseStatsDto {
  totalTestsCount: number;
  passedTestsCount: number;
  failedTestsCount: number;
  maxScore: number;
  averageScore: number;
  totalAttemptCount: number;
  difficultyLessons: DifficultyLessonDto[];
  lastAttempts: LastAttemptDto[];
}

export interface StudentCourseAnalyticsDto {
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  stats: CourseStatsDto;
}