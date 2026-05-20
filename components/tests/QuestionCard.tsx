"use client";

import { Check, CheckCircle2, Circle, ListChecks, Plus, Square, Trash2, X } from "lucide-react";
import { TestQuestion } from "@/lib/tests/types";
import { useAppDispatch } from "@/store/hooks";
import { 
  addOption,
  deleteOption,
  updateQuestionText, 
  updateQuestionType,
  updateOptionText, 
  toggleCorrectOption, 
  deleteQuestion 
} from "@/store/slices/testDraftSlice";

interface QuestionCardProps {
  question: TestQuestion;
  index: number;
  readOnly?: boolean;
}

export default function QuestionCard({ question, index, readOnly = false }: QuestionCardProps) {
  const dispatch = useAppDispatch();

  return (
    <div id={`q-${question.clientId}`} className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-sm hover:border-brand-primary/30 transition-colors">
      <div className="flex justify-between items-center mb-4 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
            <span className="font-bold text-lg">{index + 1}</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-brand-text whitespace-nowrap">Question</h3>
            <p className="text-xs text-brand-muted">{question.questionType.replace("_", " ").toLowerCase()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!readOnly && (
            <button 
              onClick={() => dispatch(deleteQuestion(question.clientId))}
              className="text-red-400 hover:bg-red-400/10 px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <label className="flex-1">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-brand-muted">
            Type
          </span>
          <select
            value={question.questionType}
            disabled={readOnly}
            onChange={(event) =>
              dispatch(
                updateQuestionType({
                  qId: question.clientId,
                  questionType: event.target.value as TestQuestion["questionType"],
                })
              )
            }
            className="w-full rounded-lg border border-brand-border bg-brand-bg px-4 py-2.5 text-sm text-brand-text outline-none transition focus:border-brand-primary disabled:opacity-70"
          >
            <option value="SINGLE_CHOICE">Single choice</option>
            <option value="MULTI_CHOICE">Multiple choice</option>
            <option value="TRUE_FALSE">True / False</option>
          </select>
        </label>
      </div>

      <textarea 
        value={question.content}
        disabled={readOnly}
        onChange={(e) => dispatch(updateQuestionText({ qId: question.clientId, newText: e.target.value }))}
        placeholder="Write the question prompt here..."
        className="w-full min-h-[80px] bg-brand-bg border border-brand-border rounded-lg p-4 text-brand-text mb-6 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none resize-y placeholder:text-brand-muted/50 font-medium disabled:opacity-70" 
      />

      <div className="space-y-3">
        {question.options.map((opt) => (
          <div 
            key={opt.clientId} 
            className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${
              opt.isCorrect ? "border-green-500/50 bg-green-500/5" : "border-transparent"
            }`}
          >
            <button 
              disabled={readOnly}
              onClick={() => dispatch(toggleCorrectOption({ qId: question.clientId, optId: opt.clientId }))}
              className={`${opt.isCorrect ? "text-green-500" : "text-brand-muted hover:text-green-400"} flex-shrink-0 transition`}
              title="Mark as correct answer"
            >
              {question.questionType === "MULTI_CHOICE" ? (
                opt.isCorrect ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded border-2 border-green-500 bg-green-500 text-brand-bg">
                    <Check size={16} strokeWidth={3} />
                  </span>
                ) : (
                  <Square size={24} />
                )
              ) : opt.isCorrect ? (
                <CheckCircle2 size={24} />
              ) : (
                <Circle size={24} />
              )}
            </button>

            <input 
              type="text" 
              value={opt.text}
              disabled={readOnly}
              onChange={(e) => dispatch(updateOptionText({ qId: question.clientId, optId: opt.clientId, newText: e.target.value }))}
              placeholder="Answer choice..."
              className={`flex-1 bg-brand-bg border rounded-lg px-4 py-2.5 text-sm focus:outline-none transition ${
                opt.isCorrect ? "border-green-500/30 text-green-700 dark:text-green-400 font-medium" : "border-brand-border text-brand-text focus:border-brand-primary"
              } disabled:opacity-70`}
            />

            {!readOnly && question.questionType !== "TRUE_FALSE" && (
              <button
                type="button"
                onClick={() =>
                  dispatch(deleteOption({ qId: question.clientId, optId: opt.clientId }))
                }
                className="rounded-md p-2 text-brand-muted transition hover:bg-red-400/10 hover:text-red-400"
                title="Remove option"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      {!readOnly && question.questionType !== "TRUE_FALSE" && (
        <button
          type="button"
          onClick={() => dispatch(addOption(question.clientId))}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-sm font-medium text-brand-text transition hover:border-brand-primary/50 hover:bg-brand-primary/5"
        >
          <Plus size={16} />
          Add option
        </button>
      )}

      {question.questionType === "MULTI_CHOICE" && (
        <p className="mt-3 flex items-center gap-2 text-xs text-brand-muted">
          <ListChecks size={14} />
          Multiple correct answers can be selected.
        </p>
      )}
    </div>
  );
}
