"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useSubmitAdaptiveSessionMutation } from "@/store/api/adaptiveApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  toggleAnswer,
  markSessionStarted,
  setResults,
} from "@/store/slices/adaptiveSlice";
import AdaptiveQuestionCard from "@/components/adaptive/AdaptiveQuestionCard";
import AdaptiveQuestionNavigator from "@/components/adaptive/AdaptiveQuestionNavigator";
import mlData from "@/public/ml-tests.json";

export default function AdaptiveTestPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    sessionId,
    exercises,
    studentAnswers,
    sessionStartedAt,
    selectedSubjectId,
    selectedTopicId,
  } = useAppSelector((s) => s.adaptive);
  const [submitAdaptiveSession, { isLoading, error }] = useSubmitAdaptiveSessionMutation();

  useEffect(() => {
    if (!sessionId) {
      router.replace("/dashboard/student/adaptive");
      return;
    }
    dispatch(markSessionStarted());
  }, [sessionId, dispatch, router]);

  const subjectName = useMemo(
    () => mlData.subjects.find((s) => s.subject_id === selectedSubjectId)?.name ?? "",
    [selectedSubjectId]
  );
  const topicName = useMemo(
    () => mlData.topics.find((t) => t.topic_id === selectedTopicId)?.name ?? "",
    [selectedTopicId]
  );

  const answeredIds = useMemo(
    () =>
      new Set(
        exercises
          .filter((ex) => ex.exerciseId && (studentAnswers[ex.exerciseId] ?? []).length > 0)
          .map((ex) => ex.exerciseId ?? "")
      ),
    [exercises, studentAnswers]
  );

  const allAnswered = answeredIds.size === exercises.length && exercises.length > 0;

  async function handleSubmit() {
    if (!sessionId || !allAnswered) return;
    const now = Date.now();
    const elapsed = sessionStartedAt ? (now - sessionStartedAt) / 1000 : 0;
    const timePerExercise = exercises.length > 0 ? elapsed / exercises.length : 0;

    try {
      const result = await submitAdaptiveSession({
        sessionId,
        data: {
          answers: exercises
            .filter((exercise) => exercise.exerciseId)
            .map((exercise) => ({
              exerciseId: exercise.exerciseId,
              givenAnswers: studentAnswers[exercise.exerciseId ?? ""] ?? [],
              timeSpent: Math.round(timePerExercise),
            })),
        },
      }).unwrap();
      dispatch(setResults(result));
      router.push("/dashboard/student/adaptive/results");
    } catch {
      // RTK Query exposes the normalized error below.
    }
  }

  if (!sessionId) return null;

  return (
    <div className="max-w-6xl mx-auto p-6 pb-20">
      <button
        onClick={() => router.push("/dashboard/student/adaptive")}
        className="flex items-center gap-2 text-brand-muted hover:text-brand-text mb-6 w-fit transition-colors"
      >
        <ChevronLeft size={20} />
        Back to picker
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-text">Adaptive Quiz</h1>
          <p className="text-brand-muted text-sm mt-1">
            {subjectName && topicName ? `${subjectName} — ${topicName}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || isLoading}
            className="bg-brand-primary text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-brand-primary/90 transition font-medium w-full sm:w-auto disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <Send size={18} />
                Submit answers
              </>
            )}
          </button>
        </div>
      </div>

      {!allAnswered && exercises.length > 0 && (
        <p className="text-brand-muted text-sm mb-6">
          Answer all questions to enable submission ({answeredIds.size}/{exercises.length} done).
        </p>
      )}

      {error && (
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-4 text-red-400 text-sm mb-6">
          {getApiErrorMessage(error)}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {exercises.map((ex, index) => (
            <AdaptiveQuestionCard
              key={ex.exerciseId ?? index}
              mode="take"
              exercise={ex}
              index={index}
              selectedAnswers={studentAnswers[ex.exerciseId ?? ""] ?? []}
              onAnswer={(exerciseId, answer, multi) =>
                dispatch(toggleAnswer({ exerciseId, answer, multi }))
              }
            />
          ))}

          <div className="pt-2">
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || isLoading}
              className="bg-brand-primary text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-brand-primary/90 transition font-medium w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  {allAnswered ? "Submit answers" : `${answeredIds.size} / ${exercises.length} answered`}
                </>
              )}
            </button>
          </div>
        </div>
        <div className="relative">
          <AdaptiveQuestionNavigator exercises={exercises} answeredIds={answeredIds} />
        </div>
      </div>
    </div>
  );
}
