"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Save, Plus, CheckCircle2, Send } from "lucide-react";

import TestSettingsPanel from "@/components/tests/TestSettingsPanel";
import QuestionCard from "@/components/tests/QuestionCard";
import QuestionNavigator from "@/components/tests/QuestionNavigator";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  useCreateQuestionMutation,
  useDeleteQuestionMutation,
  useGetTeacherQuestionsQuery,
  useUpdateQuestionMutation,
} from "@/store/api/questionsApi";
import {
  useCreateTestForLessonMutation,
  useGenerateAiTestForLessonMutation,
  useGetTestByLessonQuery,
  useInjectAiQuestionsMutation,
  usePublishTestMutation,
} from "@/store/api/testsApi";
import type {
  DraftQuestion,
  Question,
  QuestionPayload,
  TestDraftStatus,
} from "@/types/domain/tests";

export default function TestBuilderPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);  
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [questions, setQuestions] = useState<DraftQuestion[]>([]);
  const [status, setStatus] = useState<TestDraftStatus>("IDLE");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const loadedQuestionSourceRef = useRef<string | null>(null);

  const { data: lessonTest } = useGetTestByLessonQuery(selectedLessonId, {
    skip: !selectedLessonId,
  });
  const testId = activeTestId ?? lessonTest?.id ?? "";
  const {
    data: persistedQuestions,
    isSuccess: questionsLoaded,
    refetch: refetchQuestions,
  } = useGetTeacherQuestionsQuery(testId, {
    skip: !testId,
  });
  const [createTestForLesson] = useCreateTestForLessonMutation();
  const [publishTest] = usePublishTestMutation();
  const [generateAiTestForLesson, { isLoading: isGeneratingAi }] = useGenerateAiTestForLessonMutation();
  const [injectAiQuestions, { isLoading: isInjectingAi }] = useInjectAiQuestionsMutation();
  const [createQuestion] = useCreateQuestionMutation();
  const [updateQuestion] = useUpdateQuestionMutation();
  const [deleteQuestionMutation] = useDeleteQuestionMutation();

  const isGenerating = isGeneratingAi || isInjectingAi;

  useEffect(() => {
    setActiveTestId(null);
    setQuestions([]);
    setStatus("IDLE");
    setError("");
    setMessage("");
    loadedQuestionSourceRef.current = null;
  }, [selectedLessonId]);

  useEffect(() => {
    if (lessonTest?.id) {
      setActiveTestId(lessonTest.id);
    }
  }, [lessonTest?.id]);

  useEffect(() => {
    if (!testId) return;
    if (!questionsLoaded) return;

    const sourceKey = `${selectedLessonId}:${testId}`;
    if (loadedQuestionSourceRef.current === sourceKey) return;

    const drafts = (persistedQuestions ?? []).map(mapQuestionToDraft);
    setQuestions(drafts);
    setStatus(drafts.length ? "DRAFT" : "IDLE");
    loadedQuestionSourceRef.current = sourceKey;
  }, [persistedQuestions, questionsLoaded, selectedLessonId, testId]);

  const markDraft = useCallback(() => {
    setStatus("DRAFT");
    setMessage("");
  }, []);

  const handleAddManualQuestion = useCallback(() => {
    setQuestions((currentQuestions) => [
      ...currentQuestions,
      createManualQuestion(),
    ]);
    markDraft();
  }, [markDraft]);

  const handleUpdateQuestionText = useCallback((questionId: string, text: string) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === questionId ? { ...question, prompt: text } : question,
      ),
    );
    markDraft();
  }, [markDraft]);

  const handleUpdateOptionText = useCallback((questionId: string, optionId: string, text: string) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: question.options.map((option) =>
                option.id === optionId ? { ...option, label: text } : option,
              ),
            }
          : question,
      ),
    );
    markDraft();
  }, [markDraft]);

  const handleToggleCorrectOption = useCallback((questionId: string, optionId: string) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: question.options.map((option) => ({
                ...option,
                isCorrect: option.id === optionId,
              })),
            }
          : question,
      ),
    );
    markDraft();
  }, [markDraft]);

  const handleDeleteQuestion = useCallback(async (questionId: string) => {
    const question = questions.find((item) => item.id === questionId);

    try {
      if (question?.persistedQuestionId && testId) {
        await deleteQuestionMutation({
          testId,
          questionId: question.persistedQuestionId,
        }).unwrap();
      }

      setQuestions((currentQuestions) =>
        currentQuestions.filter((item) => item.id !== questionId),
      );
      markDraft();
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError));
    }
  }, [deleteQuestionMutation, markDraft, questions, testId]);

  const ensureTest = useCallback(async () => {
    if (testId) return testId;
    if (!selectedLessonId) {
      throw new Error("Select a lesson before saving a test.");
    }

    const createdTest = await createTestForLesson({
      lessonId: selectedLessonId,
      data: {
        title: "Lesson test",
        description: "Generated from the teacher test builder.",
        timeLimitSec: 1800,
        aiEnabled: true,
      },
    }).unwrap();

    if (!createdTest.id) {
      throw new Error("The test was created without an id.");
    }

    setActiveTestId(createdTest.id);
    return createdTest.id;
  }, [createTestForLesson, selectedLessonId, testId]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      validateQuestions(questions);
      const resolvedTestId = await ensureTest();
      const savedQuestions: DraftQuestion[] = [];

      for (const question of questions) {
        const payload = toQuestionPayload(question);
        const savedQuestion = question.persistedQuestionId
          ? await updateQuestion({
              testId: resolvedTestId,
              questionId: question.persistedQuestionId,
              data: payload,
            }).unwrap()
          : await createQuestion({
              testId: resolvedTestId,
              data: payload,
            }).unwrap();

        savedQuestions.push(mapQuestionToDraft(savedQuestion));
      }

      setQuestions(savedQuestions);
      loadedQuestionSourceRef.current = `${selectedLessonId}:${resolvedTestId}`;
      setStatus("SAVED");
      setMessage("Test saved.");
      await refetchQuestions();
    } catch (saveError) {
      setError(getApiErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  }, [
    createQuestion,
    ensureTest,
    questions,
    refetchQuestions,
    selectedLessonId,
    updateQuestion,
  ]);

  const handlePublish = useCallback(async () => {
    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      validateQuestions(questions);
      const resolvedTestId = await ensureTest();

      if (status !== "SAVED") {
        const savedQuestions: DraftQuestion[] = [];

        for (const question of questions) {
          const payload = toQuestionPayload(question);
          const savedQuestion = question.persistedQuestionId
            ? await updateQuestion({
                testId: resolvedTestId,
                questionId: question.persistedQuestionId,
                data: payload,
              }).unwrap()
            : await createQuestion({
                testId: resolvedTestId,
                data: payload,
              }).unwrap();

          savedQuestions.push(mapQuestionToDraft(savedQuestion));
        }

        setQuestions(savedQuestions);
      }

      await publishTest(resolvedTestId).unwrap();
      setStatus("SAVED");
      setMessage("Test published.");
      await refetchQuestions();
    } catch (publishError) {
      setError(getApiErrorMessage(publishError));
    } finally {
      setIsSaving(false);
    }
  }, [
    createQuestion,
    ensureTest,
    publishTest,
    questions,
    refetchQuestions,
    status,
    updateQuestion,
  ]);

  const handleGenerate = useCallback(async () => {
    setError("");
    setMessage("");

    try {
      const resolvedTestId = await ensureTest();
      const request = await generateAiTestForLesson({
        lessonId: selectedLessonId,
        data: { count: questionCount },
      }).unwrap();

      if (!request.requestId) {
        throw new Error("The AI service did not return a request id.");
      }

      if (request.status === "PENDING") {
        setMessage("AI generation started. Run generation again shortly to inject the finished questions.");
        return;
      }

      const injection = await injectAiQuestions({
        requestId: request.requestId,
        data: { testIdOpt: resolvedTestId },
      }).unwrap();

      loadedQuestionSourceRef.current = null;
      await refetchQuestions();
      setMessage(`AI generated ${injection.injectedCount ?? 0} question(s).`);
    } catch (generateError) {
      setError(getApiErrorMessage(generateError));
    }
  }, [
    ensureTest,
    generateAiTestForLesson,
    injectAiQuestions,
    questionCount,
    refetchQuestions,
    selectedLessonId,
  ]);

  return (
    <div className="max-w-6xl mx-auto p-6 pb-20">
      <Link href={`/dashboard/teacher/courses/${courseId}`} className="flex items-center gap-2 text-brand-muted hover:text-brand-text mb-6 w-fit transition-colors">
        <ChevronLeft size={20} />
        Back to course
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-text">AI Test Editor</h1>
          <p className="text-sm mt-2 flex items-center gap-2">
            {status === "SAVED" ? (
              <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded font-medium flex items-center gap-1">
                <CheckCircle2 size={16} /> Test saved!
              </span>
            ) : status === "DRAFT" ? (
              <span className="text-red-400 bg-red-400/10 px-2 py-1 rounded font-medium">Unsaved draft</span>
            ) : (
              <span className="text-brand-muted">Choose settings for generating tests</span>
            )}
          </p>
          {message && <p className="mt-2 text-sm text-green-500">{message}</p>}
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleAddManualQuestion}
            disabled={!selectedLessonId || isGenerating}
            className="bg-brand-surface border border-brand-border text-brand-text px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-brand-mid transition font-medium w-full sm:w-auto disabled:opacity-50"
          >
            <Plus size={18} /> Add question
          </button>
          {questions.length > 0 && (
            <>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-brand-primary text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-brand-primary/90 transition font-medium w-full sm:w-auto disabled:opacity-50"
              >
                <Save size={18} />
                {isSaving ? "Saving..." : "Save test"}
              </button>
              <button
                onClick={handlePublish}
                disabled={isSaving || isGenerating}
                className="bg-green-600 text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition font-medium w-full sm:w-auto disabled:opacity-50"
              >
                <Send size={18} />
                Publish
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <TestSettingsPanel
            courseId={courseId}
            selectedLessonId={selectedLessonId}
            questionCount={questionCount}
            isGenerating={isGenerating}
            onLessonChange={setSelectedLessonId}
            onQuestionCountChange={setQuestionCount}
            onGenerate={handleGenerate}
          />
          
          <div className="mt-8 space-y-6">
            {questions.map((q, index) => (
              <QuestionCard 
                key={q.id}
                question={q}
                index={index}
                onUpdateQuestionText={handleUpdateQuestionText}
                onUpdateOptionText={handleUpdateOptionText}
                onToggleCorrectOption={handleToggleCorrectOption}
                onDeleteQuestion={handleDeleteQuestion}
              />
            ))}
            
            {questions.length === 0 && status === "IDLE" && (
              <div className="text-center py-12 border-2 border-dashed border-brand-border rounded-xl text-brand-muted">
                No question generated yet. Use the upper panel.
              </div>
            )}
          </div>
        </div>

        <div className="relative">
          <QuestionNavigator questions={questions} />
        </div>
      </div>
    </div>
  );
}

function mapQuestionToDraft(question: Question): DraftQuestion {
  const options = (question.options ?? [])
    .slice()
    .sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0))
    .map((option, index) => ({
      id: String(option.optionId ?? `option-${index + 1}`),
      label: option.text ?? "",
      isCorrect: option.isCorrect ?? false,
    }));

  return {
    id: String(question.questionId ?? crypto.randomUUID()),
    persistedQuestionId: question.questionId,
    prompt: question.content ?? "",
    questionType: question.questionType ?? "SINGLE_CHOICE",
    difficulty: question.difficulty ?? 1,
    options: options.length ? options : createDefaultOptions(),
  };
}

function createManualQuestion(): DraftQuestion {
  return {
    id: crypto.randomUUID(),
    prompt: "",
    questionType: "SINGLE_CHOICE",
    difficulty: 1,
    options: createDefaultOptions(),
  };
}

function createDefaultOptions() {
  return [
    { id: crypto.randomUUID(), label: "Option 1", isCorrect: true },
    { id: crypto.randomUUID(), label: "Option 2", isCorrect: false },
    { id: crypto.randomUUID(), label: "Option 3", isCorrect: false },
    { id: crypto.randomUUID(), label: "Option 4", isCorrect: false },
  ];
}

function toQuestionPayload(question: DraftQuestion): QuestionPayload {
  return {
    questionType: question.questionType,
    content: question.prompt.trim(),
    difficulty: question.difficulty,
    options: question.options.map((option, index) => ({
      text: option.label.trim(),
      displayOrder: index,
      isCorrect: option.isCorrect,
    })),
  };
}

function validateQuestions(questions: DraftQuestion[]) {
  if (!questions.length) {
    throw new Error("Add at least one question before saving.");
  }

  const invalidQuestion = questions.find((question) => !question.prompt.trim());
  if (invalidQuestion) {
    throw new Error("Every question needs a prompt before saving.");
  }

  const invalidOption = questions.find((question) =>
    question.options.some((option) => !option.label.trim()),
  );
  if (invalidOption) {
    throw new Error("Every answer choice needs text before saving.");
  }

  const questionWithoutCorrectAnswer = questions.find((question) =>
    !question.options.some((option) => option.isCorrect),
  );
  if (questionWithoutCorrectAnswer) {
    throw new Error("Every question needs one correct answer.");
  }
}
