"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ChevronLeft, Loader2, Send } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  useStartAttemptMutation,
  useSubmitAttemptMutation,
} from "@/store/api/attemptsApi";
import type { StartAttempt } from "@/types/domain/tests";

type SelectedAnswers = Record<number, number[]>;

export default function StudentTestAttemptPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string | string[]; testId?: string | string[] }>;
}) {
  const router = useRouter();
  const query = use(searchParams);
  const courseId = readQueryValue(query.courseId);
  const testId = readQueryValue(query.testId);
  const [attempt, setAttempt] = useState<StartAttempt | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({});
  const [error, setError] = useState("");
  const [startAttempt, { isLoading: isStarting }] = useStartAttemptMutation();
  const [submitAttempt, { isLoading: isSubmitting }] = useSubmitAttemptMutation();

  const questions = useMemo(() => attempt?.questions ?? [], [attempt?.questions]);

  async function handleStart() {
    if (!testId) return;
    setError("");

    try {
      const startedAttempt = await startAttempt(testId).unwrap();
      setAttempt(startedAttempt);
      setSelectedAnswers({});
    } catch (startError) {
      setError(getApiErrorMessage(startError));
    }
  }

  function toggleAnswer(questionId: number | undefined, optionId: string | number | undefined, multi: boolean) {
    if (questionId === undefined || optionId === undefined) return;

    const numericOptionId = Number(optionId);
    if (!Number.isFinite(numericOptionId)) return;

    setSelectedAnswers((current) => {
      const existing = current[questionId] ?? [];
      const nextAnswers = multi
        ? existing.includes(numericOptionId)
          ? existing.filter((id) => id !== numericOptionId)
          : [...existing, numericOptionId]
        : [numericOptionId];

      return {
        ...current,
        [questionId]: nextAnswers,
      };
    });
  }

  async function handleSubmit() {
    if (!attempt?.attemptId || !testId) return;
    setError("");

    try {
      const result = await submitAttempt({
        attemptId: attempt.attemptId,
        data: {
          answers: questions
            .filter((question) => question.questionId !== undefined)
            .map((question) => ({
              questionId: question.questionId,
              selectedOptionIds: selectedAnswers[question.questionId ?? 0] ?? [],
              timeSpent: 0,
            })),
        },
      }).unwrap();

      const attemptId = result.attemptId ?? attempt.attemptId;
      const courseParam = courseId ? `&courseId=${courseId}` : "";
      router.push(`/dashboard/student/test-result?testId=${testId}&attemptId=${attemptId}${courseParam}`);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    }
  }

  if (!testId) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-red-400 flex items-center gap-3">
        <AlertCircle size={20} />
        Missing test id.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-8">
      <Link
        href="/dashboard/student/tests"
        className="flex items-center gap-2 text-sm text-brand-muted hover:text-brand-text mb-6 w-fit transition-colors"
      >
        <ChevronLeft size={16} />
        Back to tests
      </Link>

      <div className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-brand-text">
          {attempt?.test?.title ?? "Test attempt"}
        </h1>
        <p className="text-sm text-brand-muted mt-1">
          {attempt
            ? `${questions.length} question(s) loaded`
            : "Start the attempt when you are ready."}
        </p>
        {error && (
          <p className="text-sm text-red-400 mt-4 flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </p>
        )}

        {!attempt && (
          <button
            onClick={handleStart}
            disabled={isStarting}
            className="mt-6 bg-brand-primary hover:bg-brand-primary/90 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            {isStarting && <Loader2 className="animate-spin" size={18} />}
            Start test
          </button>
        )}
      </div>

      {attempt && (
        <>
          <div className="space-y-5">
            {questions.map((question, index) => {
              const questionId = question.questionId ?? index;
              const selected = selectedAnswers[questionId] ?? [];
              const isMulti = question.questionType === "MULTI_CHOICE";

              return (
                <section
                  key={questionId}
                  className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-sm"
                >
                  <div className="flex items-start gap-4 mb-5">
                    <div className="h-10 w-10 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h2 className="font-semibold text-brand-text">
                        {question.content}
                      </h2>
                      {isMulti && (
                        <p className="text-xs text-brand-muted mt-1">
                          Select all correct answers.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {(question.options ?? []).map((option) => {
                      const optionId = Number(option.optionId);
                      const checked = selected.includes(optionId);

                      return (
                        <label
                          key={String(option.optionId)}
                          className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition-colors ${
                            checked
                              ? "border-brand-primary bg-brand-primary/10"
                              : "border-brand-border bg-brand-bg hover:border-brand-primary/50"
                          }`}
                        >
                          <input
                            type={isMulti ? "checkbox" : "radio"}
                            name={`question-${questionId}`}
                            checked={checked}
                            onChange={() => toggleAnswer(question.questionId, option.optionId, isMulti)}
                            className="h-4 w-4 accent-brand-primary"
                          />
                          <span className="text-sm text-brand-text">{option.text}</span>
                        </label>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              Submit test
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function readQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
