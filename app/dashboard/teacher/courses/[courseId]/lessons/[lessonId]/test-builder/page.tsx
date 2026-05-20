"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Eye,
  Loader2,
  Plus,
  Save,
  Send,
} from "lucide-react";

import QuestionCard from "@/components/tests/QuestionCard";
import QuestionNavigator from "@/components/tests/QuestionNavigator";
import TestSettingsPanel from "@/components/tests/TestSettingsPanel";
import { fetchCourseFullView } from "@/lib/courses/api";
import { Chapter } from "@/lib/courses/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addManualQuestion,
  generateQuestionsThunk,
  loadLessonTestDraftThunk,
  publishDraftThunk,
  resetDraft,
  saveDraftThunk,
} from "@/store/slices/testDraftSlice";

type Props = {
  params: Promise<{ courseId: string; lessonId: string }>;
};

export default function LessonTestBuilderPage({ params }: Props) {
  const { courseId, lessonId } = use(params);
  const dispatch = useAppDispatch();
  const {
    test,
    questions,
    isLoading,
    isGenerating,
    isSaving,
    isPublishing,
    error,
    lastInjectionMessage,
  } = useAppSelector((state) => state.testDraft);

  const [lessonTitle, setLessonTitle] = useState("");
  const [testTitleDraft, setTestTitleDraft] = useState<string | null>(null);
  const [descriptionDraft, setDescriptionDraft] = useState<string | null>(null);
  const [timeLimitSecDraft, setTimeLimitSecDraft] = useState<number | null>(null);
  const [lessonError, setLessonError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(loadLessonTestDraftThunk(lessonId));

    return () => {
      dispatch(resetDraft());
    };
  }, [dispatch, lessonId]);

  useEffect(() => {
    let isMounted = true;

    fetchCourseFullView(courseId)
      .then(({ chapters }) => {
        const lessons = chapters.flatMap((chapter: Chapter) => chapter.lessons ?? []);
        const lesson = lessons.find((item) => item.id === lessonId);
        if (isMounted) {
          setLessonTitle(lesson?.title ?? "Selected lesson");
        }
      })
      .catch((err) => {
        if (isMounted) {
          setLessonError(err instanceof Error ? err.message : "Failed to load lesson.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [courseId, lessonId]);

  const readOnly = test?.status === "PUBLISHED";
  const busy = isLoading || isGenerating || isSaving || isPublishing;
  const testTitle = testTitleDraft ?? test?.title ?? "Lesson test";
  const description = descriptionDraft ?? test?.description ?? "";
  const timeLimitSec = timeLimitSecDraft ?? test?.timeLimitSec ?? 0;
  const statusLabel = useMemo(() => {
    if (!test) return "No test yet";
    return test.status === "PUBLISHED" ? "Published" : "Draft";
  }, [test]);

  const testPayload = {
    title: testTitle.trim() || "Lesson test",
    description,
    timeLimitSec,
    aiEnabled: true,
  };

  function handleGenerate(count: number) {
    if (readOnly) return;
    dispatch(generateQuestionsThunk({ lessonId, payload: { count } }));
  }

  function handleSave() {
    if (readOnly) return;
    dispatch(saveDraftThunk({ lessonId, test: testPayload }));
  }

  function handlePublish() {
    if (readOnly) return;
    dispatch(publishDraftThunk({ lessonId, test: testPayload }));
  }

  return (
    <div className="mx-auto max-w-6xl p-6 pb-20">
      <Link
        href={`/dashboard/teacher/courses/${courseId}`}
        className="mb-6 flex w-fit items-center gap-2 text-brand-muted transition-colors hover:text-brand-text"
      >
        <ChevronLeft size={20} />
        Back to course
      </Link>

      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold text-brand-text">Lesson Test Editor</h1>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-brand-muted">
            <span>{lessonTitle || "Selected lesson"}</span>
            <span className="text-brand-muted/60">/</span>
            <span
              className={`rounded px-2 py-1 text-xs font-semibold ${
                test?.status === "PUBLISHED"
                  ? "bg-green-500/10 text-green-500"
                  : "bg-yellow-500/10 text-yellow-500"
              }`}
            >
              {statusLabel}
            </span>
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          {!readOnly && (
            <>
              <button
                type="button"
                onClick={() => dispatch(addManualQuestion())}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-brand-border bg-brand-surface px-4 py-2.5 font-medium text-brand-text transition hover:bg-brand-mid disabled:opacity-50 sm:w-auto"
              >
                <Plus size={18} />
                Add question
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={busy || !testTitle.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-brand-border bg-brand-card px-4 py-2.5 font-medium text-brand-text transition hover:bg-brand-bg disabled:opacity-50 sm:w-auto"
              >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Save draft
              </button>

              <button
                type="button"
                onClick={handlePublish}
                disabled={busy || questions.length === 0 || !testTitle.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 font-medium text-white transition hover:bg-brand-primary/90 disabled:opacity-50 sm:w-auto"
              >
                {isPublishing ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                Publish
              </button>
            </>
          )}

          {readOnly && (
            <span className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-2.5 text-sm font-semibold text-green-500">
              <Eye size={18} />
              Read-only published test
            </span>
          )}
        </div>
      </div>

      {readOnly && (
        <div className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
          Published tests are read-only because the backend currently allows question edits only in DRAFT.
          A reopen or unpublish endpoint is needed before this test can be edited again.
        </div>
      )}

      {(error || lessonError) && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <span>{error ?? lessonError}</span>
        </div>
      )}

      {lastInjectionMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">
          <CheckCircle2 className="h-5 w-5" />
          {lastInjectionMessage}
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-[320px] items-center justify-center gap-3 rounded-xl border border-brand-border bg-brand-card p-8 text-brand-muted">
          <Loader2 className="animate-spin" />
          Loading lesson test...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <TestSettingsPanel
              lessonTitle={lessonTitle}
              title={testTitle}
              onTitleChange={setTestTitleDraft}
              description={description}
              onDescriptionChange={setDescriptionDraft}
              timeLimitSec={timeLimitSec}
              onTimeLimitChange={setTimeLimitSecDraft}
              onGenerate={handleGenerate}
              readOnly={readOnly}
            />

            <div className="mt-8 space-y-6">
              {questions.map((question, index) => (
                <QuestionCard
                  key={question.clientId}
                  question={question}
                  index={index}
                  readOnly={readOnly}
                />
              ))}

              {questions.length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-brand-border py-12 text-center text-brand-muted">
                  No questions yet. Generate AI questions or add one manually.
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <QuestionNavigator questions={questions} />
          </div>
        </div>
      )}
    </div>
  );
}
