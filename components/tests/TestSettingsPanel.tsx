"use client";

import { useState } from "react";
import { Bot, Loader2, Minus, Plus, Save } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { MIN_TEST_TIME_LIMIT_SEC } from "@/lib/tests/types";

type Props = {
  lessonTitle?: string;
  title: string;
  onTitleChange: (title: string) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
  timeLimitSec: number;
  onTimeLimitChange: (value: number) => void;
  onSaveMetadata: () => void;
  isSavingMetadata?: boolean;
  saveDisabled?: boolean;
  onGenerate: (count: number) => void;
  readOnly?: boolean;
  generateDisabled?: boolean;
  generateWarning?: string | null;
};

export default function TestSettingsPanel({
  lessonTitle,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  timeLimitSec,
  onTimeLimitChange,
  onSaveMetadata,
  isSavingMetadata = false,
  saveDisabled = false,
  onGenerate,
  readOnly = false,
  generateDisabled = false,
  generateWarning = null,
}: Props) {
  const { isGenerating } = useAppSelector((state) => state.testDraft);
  const [qCount, setQCount] = useState(5);
  const canAdjustAiCount = !readOnly && !isGenerating && !isSavingMetadata && !generateDisabled;
  const canEditMetadata = !readOnly && !isSavingMetadata;

  function updateQuestionCount(nextValue: number) {
    const normalized = Number.isFinite(nextValue) ? nextValue : 1;
    setQCount(Math.min(50, Math.max(1, normalized)));
  }

  function updateTimeLimit(nextValue: number) {
    const normalized = Number.isFinite(nextValue) ? nextValue : 0;
    onTimeLimitChange(Math.max(0, Math.floor(normalized)));
  }

  return (
    <div className="bg-brand-card border border-brand-border p-6 rounded-xl shadow-sm">
      <div className="grid gap-4 xl:grid-cols-[170px_minmax(300px,1fr)] xl:items-start">
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:col-span-2">
          <label className="min-w-0">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-brand-muted">
              Lesson
            </span>
            <input
              value={lessonTitle ?? "Selected lesson"}
              readOnly
              className="w-full rounded-lg border border-brand-border bg-brand-bg px-4 py-2.5 text-sm text-brand-muted outline-none"
            />
          </label>

          <label className="min-w-0">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-brand-muted">
              Test title
            </span>
            <input
              value={title}
              disabled={!canEditMetadata}
              onChange={(event) => onTitleChange(event.target.value)}
              className="w-full rounded-lg border border-brand-border bg-brand-bg px-4 py-2.5 text-sm text-brand-text outline-none transition focus:border-brand-primary disabled:opacity-70"
            />
          </label>

          <label className="min-w-0 sm:col-span-2">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-brand-muted">
              Description
            </span>
            <input
              value={description}
              disabled={!canEditMetadata}
              onChange={(event) => onDescriptionChange(event.target.value)}
              placeholder="Optional description"
              className="w-full rounded-lg border border-brand-border bg-brand-bg px-4 py-2.5 text-sm text-brand-text outline-none transition focus:border-brand-primary disabled:opacity-70"
            />
          </label>
        </div>

        <div>
          <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-brand-muted">
            Time limit
          </span>
          <div className="grid h-[42px] grid-cols-[38px_minmax(0,1fr)_38px] overflow-hidden rounded-lg border border-brand-border bg-brand-bg">
            <button
              type="button"
              onClick={() => updateTimeLimit(timeLimitSec - 60)}
              disabled={!canEditMetadata || timeLimitSec <= 0}
              className="flex items-center justify-center text-brand-muted transition hover:bg-brand-primary/10 hover:text-brand-text disabled:opacity-40"
              aria-label="Decrease time limit"
            >
              <Minus size={15} />
            </button>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={timeLimitSec}
              onChange={(event) => updateTimeLimit(Number(event.target.value))}
              disabled={!canEditMetadata}
              className="min-w-0 border-x border-brand-border bg-transparent px-2 text-center text-sm font-semibold text-brand-text outline-none disabled:opacity-70"
              aria-label="Time limit in seconds"
            />
            <button
              type="button"
              onClick={() => updateTimeLimit(timeLimitSec + 60)}
              disabled={!canEditMetadata}
              className="flex items-center justify-center text-brand-muted transition hover:bg-brand-primary/10 hover:text-brand-text disabled:opacity-40"
              aria-label="Increase time limit"
            >
              <Plus size={15} />
            </button>
          </div>
          {!readOnly && timeLimitSec < MIN_TEST_TIME_LIMIT_SEC && (
            <p className="mt-1.5 text-xs text-red-300">
              Minimum time limit is {MIN_TEST_TIME_LIMIT_SEC} seconds.
            </p>
          )}
          {!readOnly && !title.trim() && (
            <p className="mt-1.5 text-xs text-red-300">Test title is required.</p>
          )}
          {!readOnly && (
            <button
              type="button"
              onClick={onSaveMetadata}
              disabled={!canEditMetadata || saveDisabled}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-primary/90 disabled:opacity-50"
            >
              {isSavingMetadata ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {isSavingMetadata ? "Saving" : "Save settings"}
            </button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-[132px_minmax(150px,1fr)]">
          <div>
            <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-brand-muted">
              AI count
            </span>
            <div className="grid h-[42px] grid-cols-[36px_minmax(0,1fr)_36px] overflow-hidden rounded-lg border border-brand-border bg-brand-bg">
              <button
                type="button"
                onClick={() => updateQuestionCount(qCount - 1)}
                disabled={!canAdjustAiCount || qCount <= 1}
                className="flex items-center justify-center text-brand-muted transition hover:bg-brand-primary/10 hover:text-brand-text disabled:opacity-40"
                aria-label="Decrease AI question count"
              >
                <Minus size={15} />
              </button>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={qCount}
                onChange={(event) => updateQuestionCount(Number(event.target.value))}
                disabled={!canAdjustAiCount}
                className="min-w-0 border-x border-brand-border bg-transparent px-2 text-center text-sm font-semibold text-brand-text outline-none disabled:opacity-70"
                aria-label="AI question count"
              />
              <button
                type="button"
                onClick={() => updateQuestionCount(qCount + 1)}
                disabled={!canAdjustAiCount || qCount >= 50}
                className="flex items-center justify-center text-brand-muted transition hover:bg-brand-primary/10 hover:text-brand-text disabled:opacity-40"
                aria-label="Increase AI question count"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onGenerate(qCount)}
            disabled={readOnly || isGenerating || isSavingMetadata || generateDisabled}
            className="flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50 sm:mt-5"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Bot size={18} />}
            {isGenerating ? "Generating" : "Generate AI"}
          </button>
          {generateWarning && (
            <p className="text-xs text-amber-300 sm:col-span-2">{generateWarning}</p>
          )}
        </div>
      </div>
    </div>
  );
}
