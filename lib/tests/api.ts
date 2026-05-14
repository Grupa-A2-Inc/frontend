import { 
  DraftQuestion, 
  GenerateTestPayload,
  SubmitTestPayload,
  TestResult,
  TakeTestSession,
  TestAnalytics
} from "./types";

import { StudentProgress } from "./types";

// Baza API
const API_BASE = "https://api.adaptiveelearning.online";

// Functie utilitara: ia token-ul din localStorage
function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

// Construim header-ele pentru request (inclusiv Authorization daca exista token)
function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Functie generica pentru request-uri catre backend
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options?.headers ?? {}),
    },
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

export async function apiGenerateTest(payload: GenerateTestPayload): Promise<DraftQuestion[]> {
  const token = getAccessToken();
  const response = await fetch("/api/ai-generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (response.status === 401)
      throw new Error("Unauthorized. Please sign in again.");
    if (response.status === 403)
      throw new Error("You do not have permission.");
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = await response.json();

  // Transformăm răspunsul backend‑ului în DraftQuestion[]
  return data.questions.map((q: any, index: number) => ({
    id: `ai-${Date.now()}-${index}`,
    prompt: q.content,
    options: q.options.map((opt: any, i: number) => ({
      id: `opt-${Date.now()}-${i}`,
      label: opt.text,
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

  const test = await apiFetch<any>(
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

export async function apiStartTestSession(testId: string) {
    const data = await apiFetch<any>(`/api/v1/tests/${testId}/start`, {
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
        questions: data.questions.map((q: any) => ({
            questionId: q.questionId,
            questionType: q.questionType,
            prompt: q.content,
            options: q.options.map((opt: any) => ({
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

export async function apiSubmitTest(attemptId: string, payload: any): Promise<TestResult> {
    const formattedPayload = {
        answers: payload.answers.map((a: any) => ({
            questionId: Number(a.questionId),
            selectedOptionIds: [Number(a.selectedOptionId)],
            timeSpent: 0
        }))
    };

    const data = await apiFetch<any>(
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
  const data = await apiFetch<any>(`/api/v1/attempts/${attemptId}/result`);

  return {
    attemptId: data.attemptId,
    testId: data.testId,
    score: data.scorePercentage ?? data.score ?? 0,
    passed: data.passed ?? false,
    totalQuestions: data.questions.length,
    correctAnswers: data.questions.filter((q: any) => q.isCorrect).length,
    questions: data.questions.map((q: any) => ({
      id: q.id,
      prompt: q.content,
      selectedOptionLabel: q.options.find((o: any) => o.isSelected)?.text ?? "",
      correctOptionLabel: q.options.find((o: any) => o.isCorrect)?.text ?? "",
      isCorrect: q.isCorrect
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

export async function apiGetTestsForCourse(courseId: string): Promise<any[]> {
  return apiFetch<any[]>(`/api/v1/courses/${courseId}/tests`);
}

export async function apiGetMyAttempts(testId: string): Promise<any[]> {
  return apiFetch<any[]>(`/api/v1/tests/${testId}/my-attempts`);
}
