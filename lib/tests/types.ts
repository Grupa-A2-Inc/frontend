export type QuestionType = "SINGLE_CHOICE" | "MULTI_CHOICE" | "TRUE_FALSE";

export type TestStatus = "DRAFT" | "PUBLISHED";

export interface TestEntity {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  timeLimitSec: number;
  status: TestStatus;
  aiEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TestEditPayload {
  title: string;
  description?: string;
  timeLimitSec?: number;
  aiEnabled?: boolean;
}

export interface TestOption {
  id?: number;
  clientId: string;
  text: string;
  displayOrder: number;
  isCorrect: boolean;
}

export interface TestQuestion {
  id?: number;
  clientId: string;
  questionType: QuestionType;
  content: string;
  difficulty?: number;
  options: TestOption[];
}

export interface GenerateTestPayload {
  count: number;
}

export interface InjectionResult {
  testId: string;
  testCreated: boolean;
  injectedCount: number;
  newTotalQuestions: number;
  lessonId: string;
}

export interface TakeTestQuestion {
  questionId: number;
  questionType: QuestionType;
  prompt: string;
  difficulty?: number;
  options: {
    id: number;
    label: string;
    order: number;
  }[];
}

export interface TakeTestSession {
  attemptId: string;
  attemptNumber: number;
  startedAt: string;
  timeLimitSec: number;
  testId: string;
  title: string;
  questions: TakeTestQuestion[];
}

export interface SubmitTestPayload {
  answers: {
    questionId: string;
    selectedOptionIds: string[];
  }[];
}

export interface ResultQuestion {
  id: string;
  questionId: number;
  questionType: QuestionType;
  prompt: string;
  selectedOptionIds: number[];
  correctOptionIds: number[];
  options: {
    id: number;
    label: string;
    isSelected: boolean;
    isCorrect: boolean;
  }[];
  isCorrect: boolean;
}

export interface TestResult {
  attemptId: string;
  testId?: string;
  score: number;
  scorePercent: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  completedAt?: string;
  questions: ResultQuestion[];
}

export interface TestAnalytics {
  testId: string;
  title?: string;
  attemptsCount: number;
  averageScore: number;
  passRate: number;
  failureRate: number;
  classAverage: number;
  bestScore: number;
  worstScore: number;
  passedCount: number;
  failedCount: number;
}

export interface LessonProgress {
  lessonId: string;
  title: string;
  visited: boolean;
  visitedAt: string;
}

export interface StudentProgress {
  totalLessons: number;
  visitedLessons: number;
  progressPercent: number;
  completedAt: string;
  lessons: LessonProgress[];
}
