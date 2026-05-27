"use client";

import { use, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, CheckCircle2, ChevronLeft, CircleHelp, Loader2, Send } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearCurrentAttempt,
  startTestThunk,
  submitTestThunk,
  toggleAnswer,
} from "@/store/slices/takeTestSlice";
import { TakeTestQuestion } from "@/lib/tests/types";

type Props = {
  params: Promise<{ testId: string }>;
};

function isMulti(question: TakeTestQuestion) {
  return question.questionType === "MULTI_CHOICE";
}

export default function TakeLessonTestPage({ params }: Props) {
  const { testId } = use(params);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { session, answers, loading, error } = useAppSelector((state) => state.takeTest);

  useEffect(() => {
    dispatch(startTestThunk(testId));

    return () => {
      dispatch(clearCurrentAttempt());
    };
  }, [dispatch, testId]);

  const answeredIds = useMemo(
    () =>
      new Set(
        (session?.questions ?? [])
          .filter((question) => (answers[String(question.questionId)] ?? []).length > 0)
          .map((question) => String(question.questionId))
      ),
    [answers, session]
  );

  const allAnswered =
    Boolean(session?.questions.length) && answeredIds.size === (session?.questions.length ?? 0);

  async function handleSubmit() {
    if (!session || !allAnswered) return;

    const result = await dispatch(
      submitTestThunk({
        attemptId: session.attemptId,
        payload: {
          answers: Object.entries(answers).map(([questionId, selectedOptionIds]) => ({
            questionId,
            selectedOptionIds,
          })),
        },
      })
    );

    if (submitTestThunk.fulfilled.match(result)) {
      router.push(`/dashboard/student/tests/${testId}/results?attemptId=${session.attemptId}`);
    }
  }

  if (loading && !session) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-3 text-brand-muted">
        <Loader2 className="animate-spin text-brand-primary" />
        Loading test...
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="mx-auto mt-10 max-w-xl rounded-xl border border-red-400/30 bg-red-400/10 p-6 text-red-300">
        <div className="mb-4 flex items-center gap-2 font-semibold">
          <AlertCircle size={20} />
          {error}
        </div>
        <button
          type="button"
          onClick={() => dispatch(startTestThunk(testId))}
          className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="mx-auto max-w-6xl p-6 pb-20">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-6 flex w-fit items-center gap-2 text-brand-muted transition-colors hover:text-brand-text"
      >
        <ChevronLeft size={20} />
        Back
      </button>

      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold text-brand-text">{session.title}</h1>
          <p className="mt-1 text-sm text-brand-muted">
            Attempt {session.attemptNumber}
            {session.timeLimitSec > 0 ? ` / ${Math.round(session.timeLimitSec / 60)} min` : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allAnswered || loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 font-medium text-white transition hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          {loading ? "Submitting..." : "Submit answers"}
        </button>
      </div>

      {!allAnswered && (
        <p className="mb-6 text-sm text-brand-muted">
          Answer all questions to enable submission ({answeredIds.size}/{session.questions.length} done).
        </p>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="space-y-6 lg:col-span-3">
          {session.questions.map((question, index) => {
            const selected = answers[String(question.questionId)] ?? [];
            const multi = isMulti(question);

            return (
              <div
                key={question.questionId}
                id={`q-${question.questionId}`}
                className="rounded-xl border border-brand-border bg-brand-card p-6 shadow-sm transition-colors hover:border-brand-primary/30"
              >
                <div className="mb-5 flex items-center gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                    <CircleHelp size={26} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                        Question {index + 1}
                      </span>
                      {multi && (
                        <span className="rounded bg-brand-primary/10 px-2 py-0.5 text-xs font-medium text-brand-primary">
                          Multiple answers
                        </span>
                      )}
                    </div>
                    <p className="font-medium leading-snug text-brand-text">{question.prompt}</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {question.options.map((option) => {
                    const optionId = String(option.id);
                    const isSelected = selected.includes(optionId);

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() =>
                          dispatch(
                            toggleAnswer({
                              questionId: String(question.questionId),
                              optionId,
                              multi,
                            })
                          )
                        }
                        className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all ${
                          isSelected
                            ? "border-sky-500 bg-sky-50 text-sky-800 dark:border-brand-primary dark:bg-brand-primary/15 dark:text-white"
                            : "border-slate-300 bg-brand-bg text-gray-700 hover:border-sky-400 hover:bg-sky-50/70 dark:border-brand-border dark:text-brand-text dark:hover:border-brand-primary/50 dark:hover:bg-brand-primary/5"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center border-2 transition-colors ${
                            multi ? "rounded" : "rounded-full"
                          } ${
                            isSelected
                              ? "border-sky-600 bg-sky-600 dark:border-brand-primary dark:bg-brand-primary"
                              : "border-slate-500 bg-white dark:border-brand-border dark:bg-transparent"
                          }`}
                        >
                          {isSelected &&
                            (multi ? (
                              <Check size={14} className="text-white" strokeWidth={3} />
                            ) : (
                              <span className="h-2 w-2 rounded-full bg-white" />
                            ))}
                        </span>
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allAnswered || loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-6 py-3 font-medium text-white transition hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            {allAnswered ? "Submit answers" : `${answeredIds.size} / ${session.questions.length} answered`}
          </button>
        </div>

        <div className="relative">
          <div className="sticky top-6 hidden rounded-xl border border-brand-border bg-brand-card p-5 shadow-sm lg:block">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-brand-muted">
              Go to question
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {session.questions.map((question, index) => {
                const answered = answeredIds.has(String(question.questionId));
                return (
                  <button
                    key={question.questionId}
                    type="button"
                    onClick={() => {
                      document
                        .getElementById(`q-${question.questionId}`)
                        ?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                    className={`flex h-10 items-center justify-center rounded-lg border text-sm font-medium transition ${
                      answered
                        ? "border-brand-primary bg-brand-primary/20 text-white"
                        : "border-brand-border bg-brand-bg text-brand-text hover:border-brand-primary/50 hover:bg-brand-primary/10"
                    }`}
                  >
                    {answered ? <CheckCircle2 size={16} /> : index + 1}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-center text-xs text-brand-muted">
              {answeredIds.size} / {session.questions.length} answered
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
