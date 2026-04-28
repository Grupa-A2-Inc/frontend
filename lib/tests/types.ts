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