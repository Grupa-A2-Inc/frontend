import type {
  AdaptiveResultDto,
  AdaptiveStartDto,
  AdaptiveStartRequestDto,
  AdaptiveSubmitRequestDto,
  AnswerDto,
  ClientExerciseDto,
  ClientResultDto,
  QuestionType,
} from "@/types/api/generated";

export type ExerciseType = QuestionType;
export type AdaptiveAnswer = AnswerDto;
export type ClientExercise = ClientExerciseDto;
export type ClientResult = ClientResultDto;
export type AdaptiveStartRequest = AdaptiveStartRequestDto;
export type AdaptiveStartResponse = AdaptiveStartDto;
export type AdaptiveSubmitRequest = AdaptiveSubmitRequestDto;
export type AdaptiveSubmitResponse = AdaptiveResultDto;

export type AdaptiveSessionUiState = {
  selectedSubjectId: number | null;
  selectedTopicId: number | null;
  questionCount: number;
  sessionId: string | null;
  expiresAt: string | null;
  exercises: ClientExercise[];
  studentAnswers: Record<string, string[]>;
  sessionStartedAt: number | null;
  results: AdaptiveSubmitResponse | null;
};
