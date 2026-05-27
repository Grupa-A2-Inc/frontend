import type { Dispatch, SetStateAction } from "react";
import { entityLabel } from "./helpers";
import type { AddTarget, EditorForm } from "./types";

interface AddEntityModalProps {
  addTarget: AddTarget;
  addForm: EditorForm;
  adding: boolean;
  error: string | null;
  onClose: () => void;
  onFormChange: Dispatch<SetStateAction<EditorForm>>;
  onAdd: () => void;
}

export function AddEntityModal({
  addTarget,
  addForm,
  adding,
  error,
  onClose,
  onFormChange,
  onAdd,
}: AddEntityModalProps) {
  const kind = addTarget.kind;
  const titleBlank = addForm.title.trim().length === 0;
  const urlBlank = kind === "resource" && addForm.url.trim().length === 0;
  const invalid = titleBlank || urlBlank;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm"><div className="min-h-full flex items-center justify-center p-4">
      <div className="bg-brand-card border border-brand-primary/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-brand-text font-semibold">Add {entityLabel(kind)}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-brand-text/40 hover:text-brand-text hover:bg-brand-text/10 transition-colors"
          >
            <span className="material-symbols-rounded" style={{ fontSize: "1.2rem" }}>close</span>
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-brand-text/60 mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={addForm.title}
              onChange={event => onFormChange(form => ({ ...form, title: event.target.value }))}
              placeholder={`${entityLabel(kind)} title`}
              autoFocus
              required
              aria-invalid={titleBlank}
              className={`w-full bg-brand-bg border rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none transition-colors ${
                titleBlank ? "border-red-400/70 focus:border-red-400" : "border-brand-primary/20 focus:border-brand-primary/60"
              }`}
            />
            {titleBlank && <p className="mt-1.5 text-xs text-red-400">Title is required.</p>}
          </div>
          {kind === "lesson" && (
            <div>
              <label className="block text-xs font-medium text-brand-text/60 mb-1.5">
                Content <span className="text-brand-muted/50 font-normal">(optional)</span>
              </label>
              <textarea
                value={addForm.contentMarkdown}
                onChange={event => onFormChange(form => ({ ...form, contentMarkdown: event.target.value }))}
                rows={4}
                placeholder="Start writing lesson content..."
                className="w-full bg-brand-bg border border-brand-primary/20 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors resize-y"
              />
            </div>
          )}
          {kind === "resource" && (
            <div>
              <label className="block text-xs font-medium text-brand-text/60 mb-1.5">
                Resource URL <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                value={addForm.url}
                onChange={event => onFormChange(form => ({ ...form, url: event.target.value }))}
                placeholder="https://example.com/resource"
                required
                aria-invalid={urlBlank}
                className={`w-full bg-brand-bg border rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none transition-colors ${
                  urlBlank ? "border-red-400/70 focus:border-red-400" : "border-brand-primary/20 focus:border-brand-primary/60"
                }`}
              />
              {urlBlank && <p className="mt-1.5 text-xs text-red-400">Resource URL is required.</p>}
            </div>
          )}
        </div>
        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-brand-text/60 hover:text-brand-text border border-brand-primary/20 hover:bg-brand-text/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onAdd}
            disabled={adding || invalid}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-brand-primary hover:bg-brand-primary/90 text-white disabled:opacity-50 transition-colors"
          >
            {adding ? "Adding..." : `Add ${entityLabel(kind)}`}
          </button>
        </div>
      </div>
    </div></div>
  );
}
