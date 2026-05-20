"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ChevronLeft, Loader2, XCircle } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTestResultThunk } from "@/store/slices/takeTestSlice";

type Props = {
  searchParams?: Promise<{ attemptId?: string }>;
};

export default function TestResultsPage({ searchParams }: Props) {
  const resolvedSearchParams = searchParams ? use(searchParams) : {};
  const attemptId = resolvedSearchParams.attemptId;
  const dispatch = useAppDispatch();
  const { result, loading, error } = useAppSelector((state) => state.takeTest);

  useEffect(() => {
    if (attemptId) {
      dispatch(fetchTestResultThunk(attemptId));
    }
  }, [attemptId, dispatch]);

  if (!attemptId) {
    return (
      <div className="mx-auto mt-10 max-w-xl rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6 text-yellow-100">
        Missing attempt id for this result.
      </div>
    );
  }

  if (loading && !result) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-3 text-brand-muted">
        <Loader2 className="animate-spin text-brand-primary" />
        Loading results...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-10 max-w-xl rounded-xl border border-red-400/30 bg-red-400/10 p-6 text-red-300">
        <div className="mb-4 flex items-center gap-2 font-semibold">
          <AlertCircle size={20} />
          {error}
        </div>
        <button
          type="button"
          onClick={() => dispatch(fetchTestResultThunk(attemptId))}
          className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!result) {
    return <p className="mt-10 text-center text-brand-muted">No result found for this test.</p>;
  }

  return (
    <div className="mx-auto max-w-5xl p-6 pb-20">
      <Link
        href="/dashboard/student"
        className="mb-6 flex w-fit items-center gap-2 text-brand-muted transition-colors hover:text-brand-text"
      >
        <ChevronLeft size={20} />
        Back to dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-text">Test Results</h1>
        <p className="mt-1 text-sm text-brand-muted">Review your answers and score.</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-brand-border bg-brand-card p-5">
          <span className="block text-xs uppercase tracking-wider text-brand-muted">Score</span>
          <span className="mt-1 block text-3xl font-bold text-brand-text">
            {Math.round(result.scorePercent)}%
          </span>
        </div>
        <div className="rounded-xl border border-brand-border bg-brand-card p-5">
          <span className="block text-xs uppercase tracking-wider text-brand-muted">Correct</span>
          <span className="mt-1 block text-3xl font-bold text-brand-text">
            {result.correctAnswers} / {result.totalQuestions}
          </span>
        </div>
        <div className="rounded-xl border border-brand-border bg-brand-card p-5">
          <span className="block text-xs uppercase tracking-wider text-brand-muted">Status</span>
          <span className={`mt-2 inline-flex rounded px-2 py-1 text-sm font-semibold ${
            result.passed ? "bg-green-500/10 text-green-500" : "bg-red-400/10 text-red-400"
          }`}>
            {result.passed ? "Passed" : "Not passed"}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {result.questions.map((question, index) => (
          <div
            key={question.id}
            className={`rounded-xl border bg-brand-card p-6 shadow-sm ${
              question.isCorrect ? "border-green-500/50" : "border-red-400/50"
            }`}
          >
            <div className="mb-5 flex items-start gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-primary/10">
                {question.isCorrect ? (
                  <CheckCircle2 size={26} className="text-green-500" />
                ) : (
                  <XCircle size={26} className="text-red-400" />
                )}
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                  Question {index + 1}
                </span>
                <p className="mt-1 font-medium leading-snug text-brand-text">{question.prompt}</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {question.options.length > 0 ? (
                question.options.map((option) => {
                  let className =
                    "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium ";

                  if (option.isCorrect && option.isSelected) {
                    className += "border-green-500 bg-green-500/15 text-green-700 dark:text-green-100";
                  } else if (option.isCorrect) {
                    className += "border-green-500/40 border-dashed bg-green-500/5 text-green-700 dark:text-green-300";
                  } else if (option.isSelected) {
                    className += "border-red-400 bg-red-400/15 text-red-700 dark:text-red-200";
                  } else {
                    className += "border-brand-border bg-brand-bg text-brand-muted";
                  }

                  return (
                    <div key={option.id} className={className}>
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                        {option.isCorrect && <CheckCircle2 size={18} className="text-green-500" />}
                        {!option.isCorrect && option.isSelected && (
                          <XCircle size={18} className="text-red-400" />
                        )}
                      </span>
                      {option.label}
                    </div>
                  );
                })
              ) : (
                <div className="rounded-lg border border-brand-border bg-brand-bg p-4 text-sm text-brand-muted">
                  Selected option ids: {question.selectedOptionIds.join(", ") || "none"}
                  <br />
                  Correct option ids: {question.correctOptionIds.join(", ") || "none"}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
