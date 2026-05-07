"use client";

import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resetSession } from "@/store/slices/adaptiveSlice";
import AdaptiveQuestionCard from "@/components/adaptive/AdaptiveQuestionCard";
import mlData from "@/public/ml-tests.json";

export default function AdaptiveResultsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { results, exercises, selectedSubjectId, selectedTopicId } = useAppSelector(
    (s) => s.adaptive
  );

  const subjectName = useMemo(
    () => mlData.subjects.find((s) => s.subject_id === selectedSubjectId)?.name ?? "",
    [selectedSubjectId]
  );
  const topicName = useMemo(
    () => mlData.topics.find((t) => t.topic_id === selectedTopicId)?.name ?? "",
    [selectedTopicId]
  );

  useEffect(() => {
    if (!results) {
      router.replace("/dashboard/student/adaptive");
    }
  }, [results, router]);

  const resultMap = useMemo(() => {
    if (!results) return {};
    const map: Record<string, (typeof results.clientResults)[0]> = {};
    for (const r of results.clientResults) {
      map[r.mlExerciseId] = r;
    }
    return map;
  }, [results]);

  if (!results) return null;

  const correctCount = results.clientResults.filter((r) => r.correct).length;
  const totalCount = results.clientResults.length;
  const pct = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const scoreColor =
    pct >= 80 ? "text-green-400" : pct >= 50 ? "text-yellow-400" : "text-red-400";
  const scoreBg =
    pct >= 80 ? "bg-green-400/10 border-green-400/30" : pct >= 50 ? "bg-yellow-400/10 border-yellow-400/30" : "bg-red-400/10 border-red-400/30";

  function handleTryAgain() {
    dispatch(resetSession());
    router.push("/dashboard/student/adaptive");
  }

  return (
    <div className="max-w-6xl mx-auto p-6 pb-20">
      <button
        onClick={handleTryAgain}
        className="flex items-center gap-2 text-brand-muted hover:text-brand-text mb-6 w-fit transition-colors"
      >
        <ChevronLeft size={20} />
        Back to picker
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-text">Quiz Results</h1>
          {subjectName && topicName && (
            <p className="text-brand-muted text-sm mt-1">
              {subjectName} — {topicName}
            </p>
          )}
        </div>
        <button
          onClick={handleTryAgain}
          className="bg-brand-surface border border-brand-border text-brand-text px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-brand-mid transition font-medium w-full sm:w-auto"
        >
          <RotateCcw size={18} />
          Try another test
        </button>
      </div>

      {/* Score card */}
      <div className={`border rounded-xl p-6 mb-8 flex flex-col sm:flex-row items-center gap-6 ${scoreBg}`}>
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-brand-card border border-brand-border flex-shrink-0">
          <Trophy size={36} className={scoreColor} />
        </div>
        <div className="text-center sm:text-left">
          <p className="text-brand-muted text-sm font-medium mb-1">Your score</p>
          <p className={`text-5xl font-bold ${scoreColor}`}>{pct}%</p>
          <p className="text-brand-muted text-sm mt-2">
            {results.clientResults.filter((r) => r.correct).length} out of{" "}
            {results.clientResults.length} questions correct
          </p>
          {results.feedbackSent && (
            <span className="inline-flex items-center gap-1.5 mt-3 text-xs bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full font-medium">
              <Sparkles size={13} />
              AI feedback sent
            </span>
          )}
        </div>
      </div>

      {/* Per-question review */}
      <h2 className="text-lg font-bold text-brand-text mb-4">Question review</h2>
      <div className="space-y-6">
        {exercises.map((ex, index) => {
          const result = resultMap[ex.exerciseId];
          if (!result) return null;
          return (
            <AdaptiveQuestionCard
              key={ex.exerciseId}
              mode="review"
              exercise={ex}
              index={index}
              result={result}
            />
          );
        })}
      </div>
    </div>
  );
}
