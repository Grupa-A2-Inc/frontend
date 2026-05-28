export interface Subject {
  subject_id: number;
  name: string;
}

export interface Topic {
  topic_id: number;
  subject_id: number;
  grade: number;
  name: string;
}

export type ExerciseType = "SINGLE_CHOICE" | "MULTI_CHOICE" | "TRUE_FALSE";

export interface ClientExercise {
  exerciseId: string;
  text: string;
  type: ExerciseType;
  answers: string[];
}

export interface AdaptiveStartRequest {
  subjectId: number;
  topicId: number;
  count: number;
}

export interface AdaptiveStartResponse {
  sessionId: string;
  expiresAt: string;
  exercises: ClientExercise[];
}

export type AdaptiveJobStatus = "PENDING" | "RUNNING" | "DONE" | "FAILED";

export interface AdaptiveJobResponse {
  jobId: string;
  status: AdaptiveJobStatus;
}

export interface AdaptiveJobStatusResponse {
  jobId: string;
  status: AdaptiveJobStatus;
  error: string | null;
  session: AdaptiveStartResponse | null;
}

export interface AnswerDto {
  exerciseId: string;
  givenAnswers: string[];
  timeSpent: number;
}

export interface AdaptiveSubmitRequest {
  answers: AnswerDto[];
}

export interface ClientResult {
  mlExerciseId: string;
  correct: boolean;
  score: number;
  correctAnswers: string[];
  givenAnswers: string[];
}

export interface AdaptiveResult {
  sessionId: string;
  totalScore: number;
  clientResults: ClientResult[];
  feedbackSent: boolean;
}
