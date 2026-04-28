import type { Dispatch, SetStateAction } from "react";
import type { AddTarget, EditorNodeType, NodeForm } from "./types";
import { nodeIcon, nodeLabel } from "./helpers";

interface AddNodeModalProps {
  addTarget: AddTarget;
  addType: EditorNodeType;
  addForm: NodeForm;
  addingNode: boolean;
  addNodeErr: string | null;
  onClose: () => void;
  onTypeChange: (type: EditorNodeType) => void;
  onFormChange: Dispatch<SetStateAction<NodeForm>>;
  onAddNode: () => void;
}

export function AddNodeModal({
  addTarget,
  addType,
  addForm,
  addingNode,
  addNodeErr,
  onClose,
  onTypeChange,
  onFormChange,
  onAddNode,
}: AddNodeModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-brand-card border border-brand-primary/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-brand-text font-semibold">
            {addTarget.kind === "chapter" ? "Add Chapter" : "Add Node"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-brand-text/40 hover:text-brand-text hover:bg-brand-text/10 transition-colors"
          >
            <span className="material-symbols-rounded" style={{ fontSize: "1.2rem" }}>close</span>
          </button>
        </div>
        {addTarget.kind === "leaf" && (
          <div className="mb-5">
            <label className="block text-xs font-medium text-brand-text/60 mb-2">Type</label>
            <div className="grid grid-cols-4 gap-2">
              {(["TEXT", "FILE", "VIDEO", "TEST"] as const).map(type => (
                <button
                  key={type}
                  onClick={() => onTypeChange(type)}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-colors ${
                    addType === type
                      ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                      : "border-brand-primary/15 text-brand-text/50 hover:border-brand-primary/40 hover:text-brand-text"
                  }`}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: "1.1rem" }}>{nodeIcon(type)}</span>
                  {nodeLabel(type)}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-brand-text/60 mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={addForm.title}
              onChange={e => onFormChange(form => ({ ...form, title: e.target.value }))}
              placeholder={addTarget.kind === "chapter" ? "Chapter title" : "Node title"}
              autoFocus
              onKeyDown={e => {
                if (e.key === "Enter") onAddNode();
              }}
              className="w-full bg-brand-bg border border-brand-primary/20 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors"
            />
          </div>
          {addTarget.kind === "chapter" && (
            <div>
              <label className="block text-xs font-medium text-brand-text/60 mb-1.5">
                Description <span className="text-brand-muted/50 font-normal">(optional)</span>
              </label>
              <textarea
                value={addForm.description}
                onChange={e => onFormChange(form => ({ ...form, description: e.target.value }))}
                rows={2}
                placeholder="Optional description..."
                className="w-full bg-brand-bg border border-brand-primary/20 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors resize-none"
              />
            </div>
          )}
          {addTarget.kind === "leaf" && addType === "TEXT" && (
            <div>
              <label className="block text-xs font-medium text-brand-text/60 mb-1.5">
                Content <span className="text-brand-muted/50 font-normal">(optional - add later)</span>
              </label>
              <textarea
                value={addForm.content}
                onChange={e => onFormChange(form => ({ ...form, content: e.target.value }))}
                rows={3}
                placeholder="Start writing..."
                className="w-full bg-brand-bg border border-brand-primary/20 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors resize-none"
              />
            </div>
          )}
        </div>
        {addNodeErr && <p className="text-red-400 text-sm mt-3">{addNodeErr}</p>}
        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-brand-text/60 hover:text-brand-text border border-brand-primary/20 hover:bg-brand-text/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onAddNode}
            disabled={addingNode}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-brand-primary hover:bg-brand-primary/90 text-white disabled:opacity-50 transition-colors"
          >
            {addingNode ? "Adding..." : `Add ${addTarget.kind === "chapter" ? "Chapter" : nodeLabel(addType)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
