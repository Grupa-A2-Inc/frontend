
export interface DifficultyLesson {
  lessonId: string;
  lessonTitle: string;
  averageScore: number;
}

export interface StudentCourseStats {
  averageGrade: number;
  bestGrade: number;
  totalAttempts: number;
  lastFiveGrades: number[];
  difficultyLessons: DifficultyLesson[];
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