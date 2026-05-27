import Link from "next/link";
import type { Dispatch, SetStateAction } from "react";
import { entityIcon, entityLabel } from "./helpers";
import { LinkifyText } from "./LinkifyText";
import type { EditorEntityKind, EditorForm, EditorLesson, SelectedRef } from "./types";

interface EditorPanelProps {
  mode: "create" | "edit";
  courseId?: string;
  selected: SelectedRef | null;
  selectedKind: EditorEntityKind | null;
  selectedLesson: EditorLesson | null;
  form: EditorForm;
  saving: boolean;
  saved: boolean;
  error: string | null;
  onFormChange: Dispatch<SetStateAction<EditorForm>>;
  onSave: () => void;
}

export function EditorPanel({
  mode,
  courseId,
  selected,
  selectedKind,
  selectedLesson,
  form,
  saving,
  saved,
  error,
  onFormChange,
  onSave,
}: EditorPanelProps) {
  if (!selected || !selectedKind) {
    return (
      <div className="flex-1 overflow-y-auto p-8 bg-brand-bg">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
          <span className="material-symbols-rounded text-brand-text/8" style={{ fontSize: "4rem" }}>edit_note</span>
          <p className="text-brand-text/25 text-sm">Select a chapter, lesson, or resource to edit it</p>
        </div>
      </div>
    );
  }

  const titleBlank = form.title.trim().length === 0;
  const urlBlank = selectedKind === "resource" && form.url.trim().length === 0;

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-brand-bg">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <span className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary/10 rounded-lg text-xs font-semibold text-brand-primary uppercase tracking-wide">
            <span className="material-symbols-rounded" style={{ fontSize: "1rem" }}>{entityIcon(selectedKind)}</span>
            {entityLabel(selectedKind)}
          </span>
        </div>
        <TitleField kind={selectedKind} form={form} invalid={titleBlank} onFormChange={onFormChange} />
        {selectedKind === "lesson" && (
          <>
            <LessonContentField form={form} onFormChange={onFormChange} />
            <LessonTestAction mode={mode} courseId={courseId} lesson={selectedLesson} />
          </>
        )}
        {selectedKind === "resource" && (
          <ResourceUrlField form={form} invalid={urlBlank} onFormChange={onFormChange} />
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={onSave}
            disabled={saving || titleBlank || urlBlank}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-rounded" style={{ fontSize: "1rem" }}>
              {saving ? "hourglass_empty" : "check"}
            </span>
            {saving ? "Saving..." : `Save ${entityLabel(selectedKind)}`}
          </button>
          {saved && (
            <span className="text-emerald-400 text-sm flex items-center gap-1">
              <span className="material-symbols-rounded" style={{ fontSize: "1rem" }}>check_circle</span>
              Saved
            </span>
          )}
          {error && <span className="text-red-400 text-sm">{error}</span>}
        </div>
      </div>
    </div>
  );
}

function TitleField({
  kind,
  form,
  invalid,
  onFormChange,
}: {
  kind: EditorEntityKind;
  form: EditorForm;
  invalid: boolean;
  onFormChange: Dispatch<SetStateAction<EditorForm>>;
}) {
  return (
    <div className="mb-5">
      <label className="block text-xs font-medium text-brand-text/60 mb-1.5">
        Title <span className="text-red-400">*</span>
      </label>
      <input
        type="text"
        value={form.title}
        onChange={event => onFormChange(current => ({ ...current, title: event.target.value }))}
        placeholder={`${entityLabel(kind)} title`}
        required
        aria-invalid={invalid}
        className={`w-full bg-brand-card border rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none transition-colors ${
          invalid ? "border-red-400/70 focus:border-red-400" : "border-brand-primary/20 focus:border-brand-primary/60"
        }`}
      />
      {invalid && <p className="mt-1.5 text-xs text-red-400">Title is required.</p>}
    </div>
  );
}

function LessonContentField({
  form,
  onFormChange,
}: {
  form: EditorForm;
  onFormChange: Dispatch<SetStateAction<EditorForm>>;
}) {
  return (
    <div className="mb-5">
      <label className="block text-xs font-medium text-brand-text/60 mb-1.5">Lesson content</label>
      <textarea
        value={form.contentMarkdown}
        onChange={event => onFormChange(current => ({ ...current, contentMarkdown: event.target.value }))}
        placeholder="Write lesson content here. URLs will be recognized as hyperlinks."
        rows={12}
        className="w-full bg-brand-card border border-brand-primary/20 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors resize-y font-mono leading-relaxed"
      />
      {form.contentMarkdown.trim() && (
        <div className="mt-3 rounded-xl border border-brand-primary/10 overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-2 bg-brand-card border-b border-brand-primary/10">
            <span className="material-symbols-rounded text-brand-muted" style={{ fontSize: "0.85rem" }}>preview</span>
            <span className="text-xs text-brand-muted">Preview</span>
          </div>
          <div className="px-4 py-3 text-sm text-brand-text leading-relaxed whitespace-pre-wrap break-words">
            <LinkifyText text={form.contentMarkdown} />
          </div>
        </div>
      )}
    </div>
  );
}

function ResourceUrlField({
  form,
  invalid,
  onFormChange,
}: {
  form: EditorForm;
  invalid: boolean;
  onFormChange: Dispatch<SetStateAction<EditorForm>>;
}) {
  return (
    <div className="mb-5">
      <label className="block text-xs font-medium text-brand-text/60 mb-1.5">
        Resource URL <span className="text-red-400">*</span>
      </label>
      <input
        type="url"
        value={form.url}
        onChange={event => onFormChange(current => ({ ...current, url: event.target.value }))}
        placeholder="https://example.com/resource"
        required
        aria-invalid={invalid}
        className={`w-full bg-brand-card border rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none transition-colors ${
          invalid ? "border-red-400/70 focus:border-red-400" : "border-brand-primary/20 focus:border-brand-primary/60"
        }`}
      />
      {invalid && <p className="mt-1.5 text-xs text-red-400">Resource URL is required.</p>}
    </div>
  );
}

function LessonTestAction({
  mode,
  courseId,
  lesson,
}: {
  mode: "create" | "edit";
  courseId?: string;
  lesson: EditorLesson | null;
}) {
  if (mode === "create") {
    return (
      <div className="mb-5 p-4 bg-brand-card border border-brand-primary/15 rounded-xl text-sm text-brand-muted">
        Tests can be added after the course is created.
      </div>
    );
  }

  if (!courseId || !lesson || lesson.id.startsWith("temp_")) return null;

  return (
    <div className="mb-5 p-5 bg-brand-card border border-brand-primary/15 rounded-xl">
      <p className="text-sm text-brand-text/60 mb-4">
        Each lesson can have one test. Questions and settings are managed in the dedicated test editor.
      </p>
      <Link
        href={`/dashboard/teacher/courses/${courseId}/lessons/${lesson.id}/test-builder`}
        className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary text-sm font-medium rounded-xl hover:bg-brand-primary/20 transition-colors"
      >
        <span className="material-symbols-rounded" style={{ fontSize: "1rem" }}>quiz</span>
        {lesson.testId ? "Open Test Editor" : "Create Test"}
      </Link>
    </div>
  );
}
