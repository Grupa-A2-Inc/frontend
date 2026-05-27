"use client";

import { ClientExercise } from "@/lib/adaptive/types";

interface Props {
  exercises: ClientExercise[];
  answeredIds: Set<string>;
}

export default function AdaptiveQuestionNavigator({ exercises, answeredIds }: Props) {
  if (exercises.length === 0) return null;

  return (
    <div className="sticky top-6 bg-brand-card border border-brand-border p-5 rounded-xl shadow-sm hidden lg:block">
      <h4 className="text-xs font-bold text-brand-muted mb-4 uppercase tracking-wider">
        Go to question
      </h4>
      <div className="grid grid-cols-4 gap-2">
        {exercises.map((ex, index) => {
          const answered = answeredIds.has(ex.exerciseId);
          return (
            <button
              key={ex.exerciseId}
              onClick={() => {
                const el = document.getElementById(`q-${ex.exerciseId}`);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              className={`h-10 rounded-lg border transition font-medium text-sm flex items-center justify-center ${
                answered
                  ? "bg-brand-primary/20 border-brand-primary text-white"
                  : "bg-brand-bg border-brand-border text-brand-text hover:bg-brand-primary/10 hover:border-brand-primary/50"
              }`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-brand-muted mt-4 text-center">
        {answeredIds.size} / {exercises.length} answered
      </p>
    </div>
  );
}
