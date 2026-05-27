import Link from "next/link";
import type { Dispatch, SetStateAction } from "react";
import type { EditorLeaf, EditorNodeType, NodeForm, SelectedRef } from "./types";
import { nodeIcon, nodeLabel } from "./helpers";
import { LinkifyText } from "./LinkifyText";

interface NodeEditorPanelProps {
  selected: SelectedRef | null;
  selectedType: EditorNodeType | null;
  selectedLeaf: EditorLeaf | null;
  nodeForm: NodeForm;
  savingNode: boolean;
  saveNodeOk: boolean;
  saveNodeError: string | null;
  courseId?: string;
  onFormChange: Dispatch<SetStateAction<NodeForm>>;
  onSaveNode: () => void;
}

export function NodeEditorPanel({
  selected,
  selectedType,
  selectedLeaf,
  nodeForm,
  savingNode,
  saveNodeOk,
  saveNodeError,
  courseId,
  onFormChange,
  onSaveNode,
}: NodeEditorPanelProps) {
  const isTitleBlank = nodeForm.title.trim().length === 0;

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-brand-bg">
      {!selected ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
          <span className="material-symbols-rounded text-brand-text/8" style={{ fontSize: "4rem" }}>edit_note</span>
          <p className="text-brand-text/25 text-sm">Select a node from the tree to edit it</p>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <TypeBadge selectedType={selectedType} />
          <TitleField
            selectedType={selectedType}
            nodeForm={nodeForm}
            isTitleBlank={isTitleBlank}
            onFormChange={onFormChange}
          />
          {selectedType === "TEXT" && <TextFields nodeForm={nodeForm} onFormChange={onFormChange} />}
          {(selectedType === "FILE" || selectedType === "VIDEO") && (
            <UploadField
              selectedType={selectedType}
              nodeForm={nodeForm}
              onFormChange={onFormChange}
            />
          )}
          {selectedType === "TEST" && <TestEditorLink selectedLeaf={selectedLeaf} courseId={courseId} />}
          <SaveNodeButton
            savingNode={savingNode}
            saveNodeOk={saveNodeOk}
            saveNodeError={saveNodeError}
            isTitleBlank={isTitleBlank}
            onSaveNode={onSaveNode}
          />
        </div>
      )}
    </div>
  );
}

function TypeBadge({ selectedType }: { selectedType: EditorNodeType | null }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <span className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary/10 rounded-lg text-xs font-semibold text-brand-primary uppercase tracking-wide">
        <span className="material-symbols-rounded" style={{ fontSize: "1rem" }}>
          {selectedType ? nodeIcon(selectedType) : ""}
        </span>
        {selectedType ? nodeLabel(selectedType) : ""}
      </span>
    </div>
  );
}

interface NodeFormChildProps {
  nodeForm: NodeForm;
  onFormChange: Dispatch<SetStateAction<NodeForm>>;
}

function TitleField({
  selectedType,
  nodeForm,
  isTitleBlank,
  onFormChange,
}: NodeFormChildProps & { selectedType: EditorNodeType | null; isTitleBlank: boolean }) {
  const titleErrorId = "node-title-error";

  return (
    <div className="mb-5">
      <label className="block text-xs font-medium text-brand-text/60 mb-1.5">
        Title <span className="text-red-400">*</span>
      </label>
      <input
        type="text"
        value={nodeForm.title}
        onChange={e => onFormChange(form => ({ ...form, title: e.target.value }))}
        placeholder={selectedType === "CHAPTER" ? "Chapter title" : "Node title"}
        required
        aria-invalid={isTitleBlank}
        aria-describedby={isTitleBlank ? titleErrorId : undefined}
        className={`w-full bg-brand-card border rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none transition-colors ${
          isTitleBlank
            ? "border-red-400/70 focus:border-red-400"
            : "border-brand-primary/20 focus:border-brand-primary/60"
        }`}
      />
      {isTitleBlank && (
        <p id={titleErrorId} className="mt-1.5 text-xs text-red-400">
          Title is required.
        </p>
      )}
    </div>
  );
}

function TextFields({ nodeForm, onFormChange }: NodeFormChildProps) {
  return (
    <div className="mb-5">
      <label className="block text-xs font-medium text-brand-text/60 mb-1.5">Content</label>
      <textarea
        value={nodeForm.content}
        onChange={e => onFormChange(form => ({ ...form, content: e.target.value }))}
        placeholder="Write your content here. URLs will be automatically recognized as hyperlinks."
        rows={12}
        className="w-full bg-brand-card border border-brand-primary/20 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors resize-y font-mono leading-relaxed"
      />
      {nodeForm.content.trim() && (
        <div className="mt-3 rounded-xl border border-brand-primary/10 overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-2 bg-brand-card border-b border-brand-primary/10">
            <span className="material-symbols-rounded text-brand-muted" style={{ fontSize: "0.85rem" }}>preview</span>
            <span className="text-xs text-brand-muted">Preview</span>
          </div>
          <div className="px-4 py-3 text-sm text-brand-text leading-relaxed whitespace-pre-wrap break-words">
            <LinkifyText text={nodeForm.content} />
          </div>
        </div>
      )}
    </div>
  );
}

interface UploadFieldProps extends NodeFormChildProps {
  selectedType: "FILE" | "VIDEO";
}

function UploadField({ selectedType, nodeForm, onFormChange }: UploadFieldProps) {
  const isVideo = selectedType === "VIDEO";
  const placeholder = isVideo
    ? "https://youtube.com/watch?v=... or direct video URL"
    : "https://example.com/document.pdf";

  return (
    <div className="mb-5">
      <label className="block text-xs font-medium text-brand-text/60 mb-1.5">
        {isVideo ? "Video URL" : "File URL"}
        <span className="ml-1 text-brand-muted/50 font-normal">(paste a link)</span>
      </label>
      <input
        type="url"
        value={nodeForm.fileUrl}
        onChange={e => onFormChange(form => ({ ...form, fileUrl: e.target.value }))}
        placeholder={placeholder}
        className="w-full bg-brand-card border border-brand-primary/20 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors"
      />
      {nodeForm.fileUrl && (
        <p className="mt-1.5 text-xs text-brand-muted truncate">
          <span className="material-symbols-rounded align-middle mr-1" style={{ fontSize: "0.85rem" }}>
            {isVideo ? "videocam" : "attach_file"}
          </span>
          {nodeForm.fileUrl}
        </p>
      )}
      {!nodeForm.fileUrl && (
        <p className="mt-1.5 text-xs text-brand-muted/50">
          {isVideo
            ? "Supports YouTube, Vimeo, or any direct .mp4 / .webm link."
            : "Supports PDF, Word, images, or any publicly accessible file link."}
        </p>
      )}
      {isVideo && (
        <p className="mt-2 rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-300">
          Tests cannot be generated from video content. Add text content if you want to use AI test generation for this lesson.
        </p>
      )}
    </div>
  );
}

function TestEditorLink({
  selectedLeaf,
  courseId,
}: {
  selectedLeaf: EditorLeaf | null;
  courseId?: string;
}) {
  return (
    <div className="mb-5 p-5 bg-brand-card border border-brand-primary/15 rounded-xl">
      <p className="text-sm text-brand-text/60 mb-4">
        Tests have their own dedicated editor. Save this node first, then open the test editor to configure questions and settings.
      </p>
      {selectedLeaf && !selectedLeaf.id.startsWith("temp_") && courseId && (
        <Link
          href={`/dashboard/teacher/courses/${courseId}/lessons/${selectedLeaf.id}/test-builder`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary text-sm font-medium rounded-xl hover:bg-brand-primary/20 transition-colors"
        >
          <span className="material-symbols-rounded" style={{ fontSize: "1rem" }}>quiz</span>
          Open Test Editor
        </Link>
      )}
      {selectedLeaf?.id.startsWith("temp_") && (
        <p className="text-xs text-brand-muted/60">Save the node first to unlock the test editor.</p>
      )}
    </div>
  );
}

function SaveNodeButton({
  savingNode,
  saveNodeOk,
  saveNodeError,
  isTitleBlank,
  onSaveNode,
}: {
  savingNode: boolean;
  saveNodeOk: boolean;
  saveNodeError: string | null;
  isTitleBlank: boolean;
  onSaveNode: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onSaveNode}
        disabled={savingNode || isTitleBlank}
        className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
      >
        <span className="material-symbols-rounded" style={{ fontSize: "1rem" }}>
          {savingNode ? "hourglass_empty" : "check"}
        </span>
        {savingNode ? "Saving..." : "Save Node"}
      </button>
      {saveNodeOk && (
        <span className="text-emerald-400 text-sm flex items-center gap-1">
          <span className="material-symbols-rounded" style={{ fontSize: "1rem" }}>check_circle</span>
          Saved
        </span>
      )}
      {saveNodeError && <span className="text-red-400 text-sm">{saveNodeError}</span>}
    </div>
  );
}
