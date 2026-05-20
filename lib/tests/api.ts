/* eslint-disable @typescript-eslint/no-explicit-any */
import { ENDPOINTS } from "@/lib/api-endpoints";
import { API_BASE } from "@/lib/config";
import {
  GenerateTestPayload,
  InjectionResult,
  QuestionType,
  StudentProgress,
  SubmitTestPayload,
  TakeTestSession,
  TestAnalytics,
  TestEditPayload,
  TestEntity,
  TestOption,
  TestQuestion,
  TestResult,
} from "./types";
import {
  fetchWithAuth,
  getStoredAccessToken,
  refreshAccessToken,
} from "@/lib/fetchWithAuth";

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function isApiErrorWithStatus(err: unknown, status: number): err is ApiError {
  return err instanceof ApiError && err.status === status;
}

type ApiOptions = RequestInit & { allowNotFound?: boolean };

async function apiFetch<T>(path: string, options?: ApiOptions): Promise<T> {
  const headers = new Headers(options?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetchWithAuth(`${API_BASE}${path}`, undefined, {
    ...options,
    headers,
  });

  if (response.status === 404 && options?.allowNotFound) {
    return null as T;
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message =
      payload?.message ??
      payload?.error ??
      (response.status === 401
        ? "Unauthorized. Please sign in again."
        : response.status === 403
          ? "You do not have permission."
          : response.status === 404
            ? "Resource not found."
            : `Request failed with status ${response.status}`);
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getOptionId(data: any): number | undefined {
  return data?.optionId ?? data?.id;
}

function getQuestionId(data: any): number | undefined {
  return data?.questionId ?? data?.id;
}

function normalizeOption(data: any, index: number, correctIds: Set<number>): TestOption {
  const id = getOptionId(data);
  const isCorrect = data?.isCorrect ?? (id !== undefined && correctIds.has(id));

  return {
    id,
    clientId: id !== undefined ? `option-${id}` : `option-new-${crypto.randomUUID()}`,
    text: data?.text ?? "",
    displayOrder: asNumber(data?.displayOrder, index + 1),
    isCorrect: Boolean(isCorrect),
  };
}

function normalizeQuestion(data: any, index = 0): TestQuestion {
  const id = getQuestionId(data);
  const correctIds = new Set<number>(
    (data?.correctAnswers ?? [])
      .map((option: any) => getOptionId(option))
      .filter((optionId: unknown): optionId is number => typeof optionId === "number")
  );

  return {
    id,
    clientId: id !== undefined ? `question-${id}` : `question-new-${crypto.randomUUID()}-${index}`,
    questionType: (data?.questionType ?? "SINGLE_CHOICE") as QuestionType,
    content: data?.content ?? "",
    difficulty: data?.difficulty,
    options: (data?.options ?? []).map((option: any, optionIndex: number) =>
      normalizeOption(option, optionIndex, correctIds)
    ),
  };
}

function questionToRequest(question: TestQuestion) {
  return {
    questionType: question.questionType,
    content: question.content,
    difficulty: question.difficulty,
    options: question.options.map((option, index) => ({
      text: option.text,
      displayOrder: option.displayOrder || index + 1,
      isCorrect: option.isCorrect,
    })),
  };
}

function normalizeTest(data: any): TestEntity {
  return {
    id: data.id,
    lessonId: data.lessonId,
    title: data.title ?? "Lesson test",
    description: data.description ?? "",
    timeLimitSec: asNumber(data.timeLimitSec),
    status: data.status ?? "DRAFT",
    aiEnabled: Boolean(data.aiEnabled),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

type AiGenerateResponse = {
  requestId: string;
  status: "PENDING" | "RUNNING" | "DONE" | "SUCCESS" | "FAILED";
};

type AiRequestStatusResponse = {
  requestId: string;
  status: "PENDING" | "RUNNING" | "DONE" | "SUCCESS" | "FAILED";
  error?: string;
};

export async function apiGetTestForLesson(lessonId: string): Promise<TestEntity | null> {
  const data = await apiFetch<unknown | null>(ENDPOINTS.lessons.test(lessonId), {
    allowNotFound: true,
  });
  return data ? normalizeTest(data) : null;
}

export async function apiGetTestDetails(testId: string): Promise<TestEntity> {
  const data = await apiFetch<unknown>(ENDPOINTS.tests.byId(testId));
  return normalizeTest(data);
}

export async function apiCreateLessonTest(
  lessonId: string,
  payload: TestEditPayload
): Promise<TestEntity> {
  const data = await apiFetch<unknown>(ENDPOINTS.lessons.test(lessonId), {
    method: "POST",
    body: JSON.stringify({
      title: payload.title,
      description: payload.description ?? "",
      timeLimitSec: payload.timeLimitSec ?? 0,
      aiEnabled: payload.aiEnabled ?? false,
    }),
  });
  return normalizeTest(data);
}

export async function apiPublishTest(testId: string): Promise<TestEntity> {
  const data = await apiFetch<unknown>(ENDPOINTS.tests.publish(testId), {
    method: "PATCH",
  });
  return normalizeTest(data);
}

export async function apiGetQuestionsForTest(testId: string): Promise<TestQuestion[]> {
  const data = await apiFetch<unknown[]>(ENDPOINTS.tests.questions(testId));
  return (data ?? []).map((question, index) => normalizeQuestion(question, index));
}

export async function apiGetEditableQuestionsForTest(testId: string): Promise<TestQuestion[]> {
  const query = "?sortBy=id&sortDir=asc";
  const data = await apiFetch<unknown[]>(`${ENDPOINTS.questions.byTest(testId)}${query}`).catch(
    (err: unknown) => {
      if (isApiErrorWithStatus(err, 401)) {
        return apiFetch<unknown[]>(ENDPOINTS.tests.questions(testId));
      }
      throw err;
    }
  );
  return (data ?? []).map((question, index) => normalizeQuestion(question, index));
}

export async function apiCreateQuestion(
  testId: string,
  question: TestQuestion
): Promise<TestQuestion> {
  const options: RequestInit = {
    method: "POST",
    body: JSON.stringify(questionToRequest(question)),
  };
  const data = await apiFetch<unknown>(ENDPOINTS.questions.byTest(testId), options).catch(
    (err: unknown) => {
      if (isApiErrorWithStatus(err, 401)) {
        return apiFetch<unknown>(ENDPOINTS.tests.questions(testId), options);
      }
      throw err;
    }
  );
  return normalizeQuestion(data);
}

export async function apiUpdateQuestion(
  testId: string,
  question: TestQuestion
): Promise<TestQuestion> {
  if (question.id === undefined) {
    return apiCreateQuestion(testId, question);
  }

  const questionId = question.id;
  const options: RequestInit = {
    method: "PUT",
    body: JSON.stringify(questionToRequest(question)),
  };
  const data = await apiFetch<unknown>(ENDPOINTS.questions.byId(testId, questionId), options).catch(
    (err: unknown) => {
      if (isApiErrorWithStatus(err, 401)) {
        return apiFetch<unknown>(ENDPOINTS.tests.questionById(testId, questionId), options);
      }
      throw err;
    }
  );
  return normalizeQuestion(data);
}

export async function apiDeleteQuestion(testId: string, questionId: number): Promise<void> {
  const options: RequestInit = {
    method: "DELETE",
  };
  await apiFetch(ENDPOINTS.questions.byId(testId, questionId), options).catch((err: unknown) => {
    if (isApiErrorWithStatus(err, 401)) {
      return apiFetch(ENDPOINTS.tests.questionById(testId, questionId), options);
    }
    throw err;
  });
}

async function pollAiRequestStatus(
  requestId: string,
  intervalMs = 4000,
  maxAttempts = 75
): Promise<AiRequestStatusResponse> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const data = await apiFetch<AiRequestStatusResponse>(
      ENDPOINTS.ai.requestStatus(requestId)
    );

    if (data.status === "DONE" || data.status === "SUCCESS" || data.status === "FAILED") {
      return data;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("AI generation timed out. Please try again.");
}

export async function apiGenerateAndInjectQuestions(
  lessonId: string,
  payload: GenerateTestPayload,
  testIdOpt?: string
): Promise<{ injection: InjectionResult; test: TestEntity; questions: TestQuestion[] }> {
  const initData = await apiFetch<AiGenerateResponse>(
    ENDPOINTS.lessons.aiGenerateTest(lessonId),
    { method: "POST", body: JSON.stringify(payload) }
  );

  if (initData.status === "FAILED") {
    throw new Error("AI generation failed. Please try again.");
  }

  const status = await pollAiRequestStatus(initData.requestId);
  if (status.status === "FAILED") {
    throw new Error(status.error ?? "AI generation failed. Please try again.");
  }

  await refreshAccessToken(getStoredAccessToken());

  const injectionData = await apiFetch<InjectionResult>(
    ENDPOINTS.ai.injectQuestions(initData.requestId),
    {
      method: "POST",
      body: JSON.stringify(testIdOpt ? { testIdOpt } : {}),
    }
  );

  const test = await apiGetTestDetails(injectionData.testId);
  const questions = await apiGetEditableQuestionsForTest(injectionData.testId);

  return { injection: injectionData, test, questions };
}

export async function apiStartTestSession(testId: string): Promise<TakeTestSession> {
  const data: any = await apiFetch(ENDPOINTS.tests.start(testId), {
    method: "POST",
  });

  return {
    attemptId: data.attemptId,
    attemptNumber: data.attemptNumber,
    startedAt: data.startedAt,
    timeLimitSec: asNumber(data.timeLimitSec),
    testId: data.test?.id ?? testId,
    title: data.test?.title ?? "Lesson test",
    questions: (data.questions ?? []).map((question: any) => ({
      questionId: question.questionId,
      questionType: question.questionType ?? "SINGLE_CHOICE",
      prompt: question.content ?? "",
      difficulty: question.difficulty,
      options: (question.options ?? []).map((option: any) => ({
        id: option.optionId ?? option.id,
        label: option.text ?? "",
        order: asNumber(option.displayOrder),
      })),
    })),
  };
}

export async function apiSubmitTest(
  attemptId: string,
  payload: SubmitTestPayload
): Promise<TestResult> {
  const data: any = await apiFetch(ENDPOINTS.attempts.submit(attemptId), {
    method: "POST",
    body: JSON.stringify({
      answers: payload.answers.map((answer) => ({
        questionId: Number(answer.questionId),
        selectedOptionIds: answer.selectedOptionIds.map(Number),
        timeSpent: 0,
      })),
    }),
  });

  return normalizeResult(data);
}

export async function apiGetTestResult(attemptId: string): Promise<TestResult> {
  const data: any = await apiFetch(ENDPOINTS.attempts.result(attemptId));
  return normalizeResult(data);
}

function normalizeResult(data: any): TestResult {
  const rawQuestions = data.questions ?? data.question ?? [];
  const questions = rawQuestions.map((question: any, index: number) => {
    const questionId = question.questionId ?? question.id ?? index;
    const selectedOptionIds = (question.selectedOptionIds ?? []).map(Number);
    const correctOptionIds = (question.correctOptionIds ?? []).map(Number);

    return {
      id: String(questionId),
      questionId,
      questionType: (question.questionType ?? "SINGLE_CHOICE") as QuestionType,
      prompt: question.content ?? question.prompt ?? "",
      selectedOptionIds,
      correctOptionIds,
      options: [],
      isCorrect: Boolean(question.correct ?? question.isCorrect),
    };
  });

  const correctAnswers = questions.filter((question: any) => question.isCorrect).length;

  return {
    attemptId: data.attemptId,
    testId: data.testId,
    score: asNumber(data.score),
    scorePercent: asNumber(data.scorePercent ?? data.scorePercentage ?? data.score),
    passed: Boolean(data.passed),
    totalQuestions: questions.length,
    correctAnswers,
    completedAt: data.completedAt,
    questions,
  };
}

export async function apiGetStudentProgress(courseId: string): Promise<StudentProgress> {
  return apiFetch<StudentProgress>(ENDPOINTS.courses.myProgress(courseId));
}

export async function apiGetTestAnalytics(testId: string): Promise<TestAnalytics> {
  return apiFetch<TestAnalytics>(ENDPOINTS.tests.analyticsClassAverage(testId));
}

export async function apiGetTestsForCourse(courseId: string): Promise<unknown[]> {
  return apiFetch<unknown[]>(`/api/v1/courses/${courseId}/tests`);
}

export async function apiGetMyAttempts(testId: string): Promise<unknown[]> {
  return apiFetch<unknown[]>(ENDPOINTS.tests.myAttempts(testId));
}
