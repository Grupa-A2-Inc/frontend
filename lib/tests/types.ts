export interface TestOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

export interface DraftQuestion {
  id: string;
  prompt: string;
  options: { id: string; label: string; isCorrect: boolean }[];
}

export interface GenerateTestPayload {
  count: number;
}

// --------------------------------------------------
// Tipuri pentru sesiunea de test (student)
// --------------------------------------------------

export interface TakeTestSession {
    attemptId: string;
    attemptNumber: number;
    startedAt: string;
    timeLimitSec: number;

    
    testId: string;
    title: string;

    questions: {
        questionId: number;
        questionType: string;
        prompt: string;
        options: {
            id: number;
            label: string;
            order: number;
        }[];
    }[];
}

// --------------------------------------------------
// Tip payload pentru submit test
// --------------------------------------------------

export interface SubmitTestPayload {
  answers: {
    questionId: string;
    selectedOptionId: string;
  }[];
}

// --------------------------------------------------
// Tip rezultat test (student)
// --------------------------------------------------

export interface TestResult {
  attemptId: string;
  testId: string;
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  questions: {
    id: string;
    prompt: string;
    selectedOptionLabel: string;
    correctOptionLabel: string;
    isCorrect: boolean;
  }[];
}

// --------------------------------------------------
// Tip analytics test (profesor)
// --------------------------------------------------

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

export interface AttemptReportDTO {
  score: number;
  totalQuestions: number;
  correctCount: number;
  questions: {
    id: string;
    prompt: string;
    options: {
      text: string;
      isCorrect: boolean;
      isSelected: boolean;
    }[];
  }[];
}

export interface StudentProgress {
  courseId: string;
  courseTitle: string;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
  lastActivityDate: string;
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
