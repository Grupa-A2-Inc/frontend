
export interface DifficultyLesson {
  lessonId: string;
  lessonTitle: string;
  myBestScore: number;
  classAverage: number;
  gap: number;
}

export interface AttemptDetails {
  attemptId: string;
  testId: string;
  testTitle: string;
  score: number;
  scorePercent: number;
  passed: boolean;
  completedAt?: string;
}

export interface StudentCourseStats {
  courseTitle: string;
  totalTestCount: number;
  totalTestDone: number;
  totalTestPassed: number;
  bestScore: number;
  lowestScore: number;
  averageScore: number;
  difficultyLessons: DifficultyLesson[];
  lastAttempts: AttemptDetails[];
}

export interface StudentAverage {
  studentId: string;
  studentName: string;
  averageGrade: number;
  testsPassed: number;
  totalTests: number;
}

export interface TeacherCatalogResponse {
  content: StudentAverage[];
  totalPages: number;
  totalElements: number;
}
