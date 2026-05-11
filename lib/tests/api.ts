import { 
  DraftQuestion, 
  GenerateTestPayload,
  SubmitTestPayload,
  TestResult,
  TakeTestSession,
} from "./types";

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
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const mockQuestions: DraftQuestion[] = Array.from({ length: payload.questionCount }).map((_, i) => ({
    id: `q-${Date.now()}-${i}`,
    prompt: `[Generat de AI] Aceasta este o întrebare de test numărul ${i + 1}?`,
    options: [
      { id: `opt-${Date.now()}-A`, label: "Varianta A (Corectă)", isCorrect: true },
      { id: `opt-${Date.now()}-B`, label: "Varianta B", isCorrect: false },
      { id: `opt-${Date.now()}-C`, label: "Varianta C", isCorrect: false },
      { id: `opt-${Date.now()}-D`, label: "Varianta D", isCorrect: false },
    ],
  }));

  return mockQuestions;
}

//
// --------------------------------------------------
// 2. SALVARE TEST FINAL - PROFESOR
// --------------------------------------------------
//

export async function apiSaveFinalTest(
  lessonId: string, 
  questions: DraftQuestion[]
): Promise<{ testId: string }> {
  
  const body = {
    questions: questions.map((q) => ({
      prompt: q.prompt,
      options: q.options.map((opt) => ({
        label: opt.label,
        isCorrect: opt.isCorrect,
      })),
    })),
  };

  const data = await apiFetch<any>(
    `/api/v1/lessons/${lessonId}/test`,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );

  return { testId: data?.id ?? data?.testId };
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
  const data = await apiFetch<any>(
    `/api/v1/tests/${testId}/start`, 
    { method: "POST" }
  );

  return {
    testSessionId: data.attemptId,
    testId: data.testId,
    title: data.title,
    timeLimitSec: data.timeLimitSec,
    questions: data.questions.map((q: any) => ({
      id: q.id,
      prompt: q.prompt,
      options: q.options.map((opt: any) => ({
        id: opt.id,
        label: opt.label,
      })),
    })),
  };
}

//
// --------------------------------------------------
// 5. SUBMIT TEST - ELEV
// --------------------------------------------------
//

export async function apiSubmitTest(
  attemptId: string,
  payload: SubmitTestPayload
): Promise<TestResult> {
  const data = await apiFetch<any>(
    `/api/v1/attempts/${attemptId}/submit`,
    {
      method: "POST",
      body: JSON.stringify(payload),
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

export async function apiGetTestResult(testId: string): Promise<TestResult> {
  const data = await apiFetch<any>(
    `/api/v1/tests/${testId}/result`,
    { method: "GET" }
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
// 7. GET STUDENT PROGRESS - ELEV
// (Pentru pagina My Progress)
// --------------------------------------------------
//

export async function apiGetStudentProgress(): Promise<any[]> {
  return apiFetch<any[]>(
    `/api/v1/tests/progress`,
    { method: "GET" }
  );
}

//
// --------------------------------------------------
// 8. ANALYTICS TEST - PROFESOR
// --------------------------------------------------
//

export async function apiGetTestAnalytics(testId: string) {
  return apiFetch(`/api/v1/tests/${testId}/analytics/class-average`);
}
