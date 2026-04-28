import { DraftQuestion, GenerateTestPayload } from "./types";

export async function apiGenerateTest(payload: GenerateTestPayload): Promise<DraftQuestion[]> {

  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Generam un numar de intrebari bazat pe payload.questionCount
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

export async function apiSaveFinalTest(courseId: string, questions: DraftQuestion[]): Promise<boolean> {
  
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return true;
}