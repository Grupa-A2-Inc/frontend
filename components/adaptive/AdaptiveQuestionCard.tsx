"use client";

import { CheckCircle2, XCircle, CircleHelp, Circle } from "lucide-react";
import { ClientExercise, ClientResult, ExerciseType } from "@/lib/adaptive/types";

interface TakeProps {
  mode: "take";
  exercise: ClientExercise;
  index: number;
  selectedAnswers: string[];
  onAnswer: (exerciseId: string, answer: string, multi: boolean) => void;
}

interface ReviewProps {
  mode: "review";
  exercise: ClientExercise;
  index: number;
  result: ClientResult;
}

type AdaptiveQuestionCardProps = TakeProps | ReviewProps;

function isMulti(type: ExerciseType) {
  return type === "MULTI_CHOICE";
}

export default function AdaptiveQuestionCard(props: AdaptiveQuestionCardProps) {
  const { exercise, index, mode } = props;

  const cardBorderClass =
    mode === "review"
      ? props.result.correct
        ? "border-green-500/50"
        : "border-red-400/50"
      : "hover:border-brand-primary/30";

  return (
    <div
      id={`q-${exercise.exerciseId}`}
      className={`bg-brand-card border border-brand-border rounded-xl p-6 shadow-sm transition-colors ${cardBorderClass}`}
    >
      <div className="flex items-center gap-4 mb-5">
        <div className="w-11 h-11 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary flex-shrink-0">
          {mode === "review" ? (
            props.result.correct ? (
              <CheckCircle2 size={26} className="text-green-500" />
            ) : (
              <XCircle size={26} className="text-red-400" />
            )
          ) : (
            <CircleHelp size={26} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">
              Question {index + 1}
            </span>
            {mode === "review" && (
              <span
                className={`text-xs px-2 py-0.5 rounded font-medium ${props.result.correct
                  ? "bg-green-500/10 text-green-500"
                  : "bg-red-400/10 text-red-400"
                  }`}
              >
                {props.result.correct ? `+${props.result.score.toFixed(1)}` : "0"}
              </span>
            )}
            {mode === "take" && isMulti(exercise.type) && (
              <span className="text-xs px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary font-medium">
                Multiple answers
              </span>
            )}
          </div>
          <p className="text-brand-text font-medium leading-snug">{exercise.text}</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {exercise.answers.map((answer) => {
          if (mode === "take") {
            const selected = props.selectedAnswers.includes(answer);
            const multi = isMulti(exercise.type);
            return (
              <button
                key={answer}
                onClick={() => props.onAnswer(exercise.exerciseId, answer, multi)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all text-sm font-medium flex items-center gap-3 ${selected
                  ? "border-sky-500 bg-sky-50 text-sky-800 dark:border-brand-primary dark:bg-brand-primary/15 dark:text-white"
                  : "border-slate-300 bg-brand-bg text-gray-700 hover:border-sky-400 hover:bg-sky-50/70 dark:border-brand-border dark:text-brand-text dark:hover:border-brand-primary/50 dark:hover:bg-brand-primary/5"
                  }`}
              >
                <span
                  className={`w-5 h-5 ${multi ? "rounded-sm" : "rounded-full"} border-2 flex-shrink-0 flex items-center justify-center transition-colors ${selected
                      ? "border-sky-600 bg-sky-600 dark:border-brand-primary dark:bg-brand-primary"
                      : "border-slate-500 bg-white dark:border-brand-border dark:bg-transparent"
                    }`}
                >
                  {selected && <span className={`${multi ? "w-3 h-3" : "w-2 h-2 rounded-full"} bg-white`} />}
                </span>
                {answer}
              </button>
            );
          }

          // review mode
          const isCorrect = props.result.correctAnswers.includes(answer);
          const wasSelected = props.result.givenAnswers.includes(answer);

          let className =
            "w-full text-left px-4 py-3 rounded-lg border text-sm font-medium flex items-center gap-3 ";
          if (isCorrect && wasSelected) {
            className += "bg-green-500/15 border-green-500 text-green-700 dark:text-green-100";
          } else if (isCorrect && !wasSelected) {
            className += "bg-green-500/5 border-green-500/40 border-dashed text-green-700 dark:text-green-300";
          } else if (!isCorrect && wasSelected) {
            className += "bg-red-400/15 border-red-400 text-red-700 dark:text-red-200";
          } else {
            className += "bg-brand-bg border-brand-border text-brand-muted";
          }

          return (
            <div key={answer} className={className}>
              <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                {isCorrect && wasSelected && <CheckCircle2 size={18} className="text-green-500" />}
                {!isCorrect && wasSelected && <XCircle size={18} className="text-red-400" />}
                {isCorrect && !wasSelected && <Circle size={18} className="text-green-500/60" />}
              </span>
              {answer}
            </div>
          );
        })}
      </div>
    </div>
  );
}
