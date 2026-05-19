import { 
  DraftQuestion, 
  GenerateTestPayload,
  SubmitTestPayload,
  TestResult,
  TakeTestSession,
  TestAnalytics
} from "./types";

import { StudentProgress } from "./types";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

// Baza API
const API_BASE = "https://api.adaptiveelearning.online";

type AiOptionDto = {
  text?: string;
  isCorrect?: boolean;
};

type AiQuestionDto = {
  content?: string;
  options?: AiOptionDto[];
};

type AiGenerateResponse = {
  questions?: AiQuestionDto[];
};

type AiGenerateRequestResponse = {
  requestId: string;
  status: "PENDING" | "DONE" | "SUCCESS" | "FAILED";
};

type AiRequestStatusResponse = {
  requestId: string;
  status: "PENDING" | "DONE" | "SUCCESS" | "FAILED";
  questions?: AiQuestionDto[];
};

type AiInjectResponse = {
  questions?: AiQuestionDto[];
}

type CreatedTestDto = {
  id: string;
};

type StartTestOptionDto = {
  optionId: number;
  text: string;
  displayOrder: number;
};

type StartTestQuestionDto = {
  questionId: number;
  questionType: string;
  content: string;
  options?: StartTestOptionDto[];
};

type StartTestDto = {
  attemptId: string;
  attemptNumber: number;
  startedAt: string;
  timeLimitSec: number;
  test: {
    id: string;
    title: string;
  };
  questions?: StartTestQuestionDto[];
};

type SubmitResultDto = {
  attemptId: string;
  testId: string;
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  questions: TestResult["questions"];
};

type ResultOptionDto = {
  text?: string;
  isCorrect?: boolean;
  isSelected?: boolean;
};

type ResultQuestionDto = {
  id?: string | number;
  content?: string;
  options?: ResultOptionDto[];
  isCorrect?: boolean;
};

type AttemptResultDto = {
  attemptId: string;
  testId: string;
  scorePercentage?: number;
  score?: number;
  passed?: boolean;
  questions?: ResultQuestionDto[];
};

// Functie generica pentru request-uri catre backend
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetchWithAuth(`${API_BASE}${path}`, undefined, {
    ...options,
    headers,
  });

  // Gestionam erorile standard
  if (!response.ok) {
    if (response.status === 401)
      throw new Error("Unauthorized. Please sign in again.");
    if (response.status === 403) 
      throw new Error("You do not have permission.");
    if (response.status === 404) 
      throw new Error("Resource not found.");
    throw new Error(`Request failed with status ${response.status}`);
  }

  // Daca backend-ul raspunde cu 204 (no content), returnam null
  if (response.status === 204)
    return null as T;

  // Altfel, returnam JSON-ul
  return response.json();
}

//
// --------------------------------------------------
// 1. GENERARE TEST (AI) - PROFESOR
// --------------------------------------------------
//

// Helper de polling
async function pollAiRequestStatus(
  requestId: string,
  intervalMs = 5000,
  maxAttempts = 60
): Promise<AiRequestStatusResponse> {
  for (let i = 0; i< maxAttempts; i++) {
    const data = await apiFetch<AiRequestStatusResponse>(
      `/api/v1/ai/requests/${requestId}/status`
    );
    if (data.status === "DONE" || data.status === "SUCCESS" || data.status === "FAILED") {
      return data;
    }
    await new Promise((resolve) => setTimeout (resolve, intervalMs));
  }
  throw new Error("AI generation timed out. Please try again");
}

export async function apiGenerateTest(
  lessonId: string,
  payload: GenerateTestPayload
): Promise<DraftQuestion[]> {
  // PASUL 1: porneste generarea
  const initData = await apiFetch<AiGenerateRequestResponse>(
    `/api/v1/lessons/${lessonId}/ai/generate-test`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  if (initData.status === "FAILED") {
    throw new Error("AI generation failed. Please try again.=");
  }

  // PASUl 2: polling pana la SUCCESS/FAILED
  const result = await pollAiRequestStatus(initData.requestId);

  if (result.status === "FAILED") {
    throw new Error("AI generation failed. Please try again");
  }

  // PASUL 3: inject intrebari
  const injectResult = await apiFetch<AiInjectResponse>(`/api/v1/ai/request/${initData.requestId}/inject`, {
    method: "POST",
    body: JSON.stringify({}),
  });

  const questions = injectResult.questions ?? result.questions ?? [];

  return questions.map((q, index) => ({
    id: `ai-${Date.now()}-${index}`,
    prompt: q.content ?? "",
    options: (q.options ?? []).map((opt, i) => ({
      id: `opt-${Date.now()}-${i}`,
      label: opt.text ?? "",
      isCorrect: opt.isCorrect ?? false,
    })),
  }));
}

//
// --------------------------------------------------
// 2. SALVARE TEST FINAL - PROFESOR
// --------------------------------------------------
//

export async function apiSaveFinalTest(
  lessonId: string,
  questions: DraftQuestion[],
  title: string,
  timeLimitSec?: number
): Promise<{ testId: string }> {

  // 1. Creează testul fără întrebări
  const body = {
    title,
    description: "",
    timeLimitSec: timeLimitSec ?? 0,
    aiEnabled: false
  };

  const test = await apiFetch<CreatedTestDto>(
    `/api/v1/lessons/${lessonId}/test`,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );

  const testId = test.id;

  // 2. Adaugă întrebările una câte una
  for (const q of questions) {
    await apiFetch(
      `/api/v1/tests/${testId}/questions`,
      {
        method: "POST",
        body: JSON.stringify({
          content: q.prompt,
          questionType: "SINGLE_CHOICE",
          options: q.options.map((opt, index) => ({
            text: opt.label,
            displayOrder: index + 1
          }))
        })
      }
    );
  }

  return { testId };
}

//
// --------------------------------------------------
// 3. PUBLICARE TEST - PROFESOR
// --------------------------------------------------
//

export async function apiPublishTest(testId: string): Promise<void> {
  await apiFetch(`/api/v1/tests/${testId}/publish`, {
    method: "PATCH",
  });
}

//
// --------------------------------------------------
// 4. START TEST - ELEV
// --------------------------------------------------
//

export async function apiStartTestSession(testId: string): Promise<TakeTestSession> {
    const data = await apiFetch<StartTestDto>(`/api/v1/tests/${testId}/start`, {
        method: "POST",
    });

    return {
        attemptId: data.attemptId,
        attemptNumber: data.attemptNumber,
        startedAt: data.startedAt,
        timeLimitSec: data.timeLimitSec,

        // test info
        testId: data.test.id,
        title: data.test.title,

        // questions
        questions: (data.questions ?? []).map((q) => ({
            questionId: q.questionId,
            questionType: q.questionType,
            prompt: q.content,
            options: (q.options ?? []).map((opt) => ({
                id: opt.optionId,
                label: opt.text,
                order: opt.displayOrder,
            })),
        })),
    };
}

//
// --------------------------------------------------
// 5. SUBMIT TEST - ELEV
// --------------------------------------------------
//

export async function apiSubmitTest(attemptId: string, payload: SubmitTestPayload): Promise<TestResult> {
    const formattedPayload = {
        answers: payload.answers.map((a) => ({
            questionId: Number(a.questionId),
            selectedOptionIds: [Number(a.selectedOptionId)],
            timeSpent: 0
        }))
    };

    const data = await apiFetch<SubmitResultDto>(
        `/api/v1/attempts/${attemptId}/submit`,
        {
            method: "POST",
            body: JSON.stringify(formattedPayload),
        }
    );

    return {
        attemptId: data.attemptId,
        testId: data.testId,
        score: data.score,
        passed: data.passed,
        totalQuestions: data.totalQuestions,
        correctAnswers: data.correctAnswers,
        questions: data.questions,
    };
}

//
// --------------------------------------------------
// 6. GET TEST RESULT - ELEV
// (Pentru pagina de rezultate)
// --------------------------------------------------
//

export async function apiGetTestResult(attemptId: string): Promise<TestResult> {
  const data = await apiFetch<AttemptResultDto>(`/api/v1/attempts/${attemptId}/result`);
  const questions = data.questions ?? [];

  return {
    attemptId: data.attemptId,
    testId: data.testId,
    score: data.scorePercentage ?? data.score ?? 0,
    passed: data.passed ?? false,
    totalQuestions: questions.length,
    correctAnswers: questions.filter((q) => q.isCorrect).length,
    questions: questions.map((q) => ({
      id: String(q.id ?? ""),
      prompt: q.content ?? "",
      selectedOptionLabel: (q.options ?? []).find((o) => o.isSelected)?.text ?? "",
      correctOptionLabel: (q.options ?? []).find((o) => o.isCorrect)?.text ?? "",
      isCorrect: q.isCorrect ?? false
    }))
  };
}

//
// --------------------------------------------------
// 7. GET STUDENT PROGRESS - ELEV
// (Pentru pagina My Progress)
// --------------------------------------------------
//

export async function apiGetStudentProgress(courseId: string): Promise<StudentProgress> {
  return apiFetch<StudentProgress>(`/api/v1/courses/${courseId}/my-progress`);
}

//
// --------------------------------------------------
// 8. ANALYTICS TEST - PROFESOR
// --------------------------------------------------
//

export async function apiGetTestAnalytics(testId: string): Promise<TestAnalytics> {
  return apiFetch<TestAnalytics>(`/api/v1/tests/${testId}/analytics/class-average`);
}

export async function apiGetTestsForCourse(courseId: string): Promise<unknown[]> {
  return apiFetch<unknown[]>(`/api/v1/courses/${courseId}/tests`);
}

export async function apiGetMyAttempts(testId: string): Promise<unknown[]> {
  return apiFetch<unknown[]>(`/api/v1/tests/${testId}/my-attempts`);
}
