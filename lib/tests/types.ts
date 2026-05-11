export interface TestOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

export interface DraftQuestion {
  id: string;
  prompt: string;
  options: TestOption[];
}

export interface GenerateTestPayload {
  courseId: string;
  questionCount: number;
}

// --------------------------------------------------
// Tipuri pentru sesiunea de test (student)
// --------------------------------------------------

export interface TakeTestSession {
  testSessionId: string;   // attemptId din backend
  testId: string;
  title: string;
  timeLimitSec: number;
  questions: {
    id: string;
    prompt: string;
    options: {
      id: string;
      label: string;
    }[];
  }[];
}

// --------------------------------------------------
// Tip payload pentru submit test
// --------------------------------------------------

export interface SubmitTestPayload {
  answers: {
    questionId: string;
    optionId: string;
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
