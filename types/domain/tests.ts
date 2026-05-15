import type {
  AiGenerateRequestDto,
  AiGenerateResponseDto,
  AiRequestStatusDto,
  AttemptReportDTO,
  InjectRequestDto,
  InjectionResultDto,
  OptionRequestDto,
  OptionResponseDto,
  QuestionRequestDto,
  QuestionResponseDto,
  QuestionType,
  StartAttemptResponseDto,
  SubmitRequestDto,
  TestEditDto,
  TestEntityDto,
  TestResultDto,
} from "@/types/api/generated";

export type Test = TestEntityDto;
export type TestEditPayload = TestEditDto;
export type Question = QuestionResponseDto;
export type QuestionPayload = QuestionRequestDto;
export type QuestionOptionPayload = OptionRequestDto;
export type QuestionOption = OptionResponseDto;
export type GenerateAiTestPayload = AiGenerateRequestDto;
export type AiGenerationRequest = AiGenerateResponseDto;
export type AiGenerationStatus = AiRequestStatusDto;
export type InjectAiQuestionsPayload = InjectRequestDto;
export type InjectionResult = InjectionResultDto;
export type StartAttemptResult = StartAttemptResponseDto;
export type SubmitAttemptPayload = SubmitRequestDto;
export type TestResult = TestResultDto;
export type AttemptReport = AttemptReportDTO;
export type StartAttempt = StartAttemptResponseDto;

export type TestOption = {
  id: string;
  label: string;
  isCorrect: boolean;
};

export type DraftQuestion = {
  id: string;
  persistedQuestionId?: number;
  prompt: string;
  questionType: QuestionType;
  difficulty: number;
  options: TestOption[];
};

export type TestDraftStatus = "IDLE" | "DRAFT" | "SAVED";

export type CourseLessonTestSummary = {
  testId: string;
  courseId: string;
  courseTitle: string;
  chapterId: string;
  chapterTitle: string;
  lessonId: string;
  lessonTitle: string;
};
