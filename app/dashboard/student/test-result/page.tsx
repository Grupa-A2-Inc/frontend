"use client";

import { use } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ChevronLeft, Loader2, XCircle } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useGetAttemptResultQuery } from "@/store/api/testResultsApi";

export default function StudentTestResultPage({
  searchParams,
}: {
  searchParams: Promise<{
    attemptId?: string | string[];
    courseId?: string | string[];
    testId?: string | string[];
  }>;
}) {
  const query = use(searchParams);
  const attemptId = readQueryValue(query.attemptId);
  const courseId = readQueryValue(query.courseId);
  const testId = readQueryValue(query.testId);
  const {
    data: result,
    isLoading,
    error,
  } = useGetAttemptResultQuery(attemptId ?? "", {
    skip: !attemptId,
  });

  if (!attemptId) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-red-400 flex items-center gap-3">
        <AlertCircle size={20} />
        Missing attempt id.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-red-400 flex items-center gap-3">
        <AlertCircle size={20} />
        {error ? getApiErrorMessage(error) : "Result not found."}
      </div>
    );
  }

  const questions = result.question ?? [];
  const backHref = courseId && testId
    ? `/dashboard/student/test-attempt?courseId=${courseId}&testId=${testId}`
    : "/dashboard/student/tests";

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-8">
      <Link
        href={backHref}
        className="flex items-center gap-2 text-sm text-brand-muted hover:text-brand-text mb-6 w-fit transition-colors"
      >
        <ChevronLeft size={16} />
        Back to test
      </Link>

      <div className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-text">Test result</h1>
            <p className="text-sm text-brand-muted mt-1">
              Attempt {result.attemptId}
            </p>
          </div>
          <div
            className={`flex items-center gap-2 rounded-lg px-4 py-2 font-semibold ${
              result.passed
                ? "bg-green-500/10 text-green-500"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {result.passed ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
            {result.passed ? "Passed" : "Not passed"}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="bg-brand-bg border border-brand-border rounded-lg p-4">
            <span className="text-xs uppercase text-brand-muted">Score</span>
            <p className="text-2xl font-bold text-brand-text mt-1">
              {result.score ?? 0}
            </p>
          </div>
          <div className="bg-brand-bg border border-brand-border rounded-lg p-4">
            <span className="text-xs uppercase text-brand-muted">Percent</span>
            <p className="text-2xl font-bold text-brand-text mt-1">
              {Math.round(result.scorePercent ?? 0)}%
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <section
            key={question.questionId ?? index}
            className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-sm"
          >
            <h2 className="font-semibold text-brand-text">
              {index + 1}. {question.content}
            </h2>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-brand-bg border border-brand-border rounded-lg p-3">
                <span className="block text-xs uppercase text-brand-muted mb-1">
                  Your option IDs
                </span>
                <span className="text-brand-text">
                  {(question.selectedOptionIds ?? []).join(", ") || "None"}
                </span>
              </div>
              <div className="bg-brand-bg border border-brand-border rounded-lg p-3">
                <span className="block text-xs uppercase text-brand-muted mb-1">
                  Correct option IDs
                </span>
                <span className="text-brand-text">
                  {(question.correctOptionIds ?? []).join(", ") || "None"}
                </span>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function readQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
