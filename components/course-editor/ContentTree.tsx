import type { EditorChapter, EditorLeaf, MoveDirection, SelectedRef } from "./types";
import { nodeIcon } from "./helpers";

interface ContentTreeProps {
  chapters: EditorChapter[];
  selected: SelectedRef | null;
  onSelect: (selected: SelectedRef) => void;
  onAddChapter: () => void;
  onAddLeaf: (chapterId: string) => void;
  onMoveChapter: (id: string, direction: MoveDirection) => void;
  onMoveLeaf: (chapterId: string, leafId: string, direction: MoveDirection) => void;
  onDeleteChapter: (chapter: EditorChapter) => void;
  onDeleteLeaf: (chapterId: string, leaf: EditorLeaf) => void;
}

export function ContentTree({
  chapters,
  selected,
  onSelect,
  onAddChapter,
  onAddLeaf,
  onMoveChapter,
  onMoveLeaf,
  onDeleteChapter,
  onDeleteLeaf,
}: ContentTreeProps) {
  return (
    <section className="flex-1 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-muted">Content</p>
        <button
          onClick={onAddChapter}
          className="flex items-center gap-1 text-xs font-medium text-brand-primary hover:text-brand-primary/70 transition-colors"
        >
          <span className="material-symbols-rounded" style={{ fontSize: "1rem" }}>add</span>
          Add Chapter
        </button>
      </div>
      {chapters.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
          <span className="material-symbols-rounded text-brand-text/10" style={{ fontSize: "2.5rem" }}>folder_open</span>
          <p className="text-brand-text/30 text-xs">No chapters yet.<br />Add your first one above.</p>
        </div>
      )}
      <div className="flex flex-col gap-2">
        {chapters.map((chapter, chapterIndex) => (
          <ChapterRow
            key={chapter.id}
            chapter={chapter}
            chapterIndex={chapterIndex}
            chapterCount={chapters.length}
            selected={selected}
            onSelect={onSelect}
            onAddLeaf={onAddLeaf}
            onMoveChapter={onMoveChapter}
            onMoveLeaf={onMoveLeaf}
            onDeleteChapter={onDeleteChapter}
            onDeleteLeaf={onDeleteLeaf}
          />
        ))}
      </div>
    </section>
  );
}

interface ChapterRowProps {
  chapter: EditorChapter;
  chapterIndex: number;
  chapterCount: number;
  selected: SelectedRef | null;
  onSelect: (selected: SelectedRef) => void;
  onAddLeaf: (chapterId: string) => void;
  onMoveChapter: (id: string, direction: MoveDirection) => void;
  onMoveLeaf: (chapterId: string, leafId: string, direction: MoveDirection) => void;
  onDeleteChapter: (chapter: EditorChapter) => void;
  onDeleteLeaf: (chapterId: string, leaf: EditorLeaf) => void;
}

function ChapterRow({
  chapter,
  chapterIndex,
  chapterCount,
  selected,
  onSelect,
  onAddLeaf,
  onMoveChapter,
  onMoveLeaf,
  onDeleteChapter,
  onDeleteLeaf,
}: ChapterRowProps) {
  const chapterSelected = selected?.kind === "chapter" && selected.id === chapter.id;

  return (
    <div className="rounded-xl border border-brand-primary/15 overflow-hidden">
      <div
        onClick={() => onSelect({ kind: "chapter", id: chapter.id })}
        className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors ${
          chapterSelected ? "bg-brand-primary/15" : "bg-brand-card hover:bg-brand-primary/8"
        }`}
      >
        <span className="material-symbols-rounded text-brand-primary flex-shrink-0" style={{ fontSize: "1rem" }}>folder</span>
        <span className="flex-1 text-sm font-medium text-brand-text truncate min-w-0">
          {chapter.title || "Untitled Chapter"}
        </span>
        <div className="flex items-center gap-0.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onMoveChapter(chapter.id, "UP")}
            disabled={chapterIndex === 0}
            className="w-6 h-6 flex items-center justify-center text-brand-text/30 hover:text-brand-text disabled:opacity-20 transition-colors rounded"
          >
            <span className="material-symbols-rounded" style={{ fontSize: "0.9rem" }}>expand_less</span>
          </button>
          <button
            onClick={() => onMoveChapter(chapter.id, "DOWN")}
            disabled={chapterIndex === chapterCount - 1}
            className="w-6 h-6 flex items-center justify-center text-brand-text/30 hover:text-brand-text disabled:opacity-20 transition-colors rounded"
          >
            <span className="material-symbols-rounded" style={{ fontSize: "0.9rem" }}>expand_more</span>
          </button>
          <button
            onClick={() => onDeleteChapter(chapter)}
            className="w-6 h-6 flex items-center justify-center text-brand-text/20 hover:text-red-400 transition-colors rounded"
          >
            <span className="material-symbols-rounded" style={{ fontSize: "0.9rem" }}>delete</span>
          </button>
        </div>
      </div>
      <div className="border-t border-brand-primary/8">
        {chapter.children.map((leaf, leafIndex) => (
          <LeafRow
            key={leaf.id}
            chapterId={chapter.id}
            leaf={leaf}
            leafIndex={leafIndex}
            leafCount={chapter.children.length}
            selected={selected}
            onSelect={onSelect}
            onMoveLeaf={onMoveLeaf}
            onDeleteLeaf={onDeleteLeaf}
          />
        ))}
        <button
          onClick={() => onAddLeaf(chapter.id)}
          className="flex items-center gap-1.5 px-3 py-2 pl-6 w-full text-xs text-brand-primary/50 hover:text-brand-primary transition-colors"
        >
          <span className="material-symbols-rounded" style={{ fontSize: "0.9rem" }}>add</span>
          Add node
        </button>
      </div>
    </div>
  );
}

interface LeafRowProps {
  chapterId: string;
  leaf: EditorLeaf;
  leafIndex: number;
  leafCount: number;
  selected: SelectedRef | null;
  onSelect: (selected: SelectedRef) => void;
  onMoveLeaf: (chapterId: string, leafId: string, direction: MoveDirection) => void;
  onDeleteLeaf: (chapterId: string, leaf: EditorLeaf) => void;
}

function LeafRow({
  chapterId,
  leaf,
  leafIndex,
  leafCount,
  selected,
  onSelect,
  onMoveLeaf,
  onDeleteLeaf,
}: LeafRowProps) {
  const leafSelected = selected?.kind === "leaf" && selected.id === leaf.id;

  return (
    <div
      onClick={() => onSelect({ kind: "leaf", chapterId, id: leaf.id })}
      className={`flex items-center gap-2 px-3 py-2 pl-6 cursor-pointer transition-colors ${
        leafSelected ? "bg-brand-primary/10" : "hover:bg-brand-primary/5"
      }`}
    >
      <span className="material-symbols-rounded text-brand-primary/60 flex-shrink-0" style={{ fontSize: "0.9rem" }}>
        {nodeIcon(leaf.type)}
      </span>
      <span className="flex-1 text-xs text-brand-text truncate min-w-0">
        {leaf.title || "Untitled"}
      </span>
      <div className="flex items-center gap-0.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => onMoveLeaf(chapterId, leaf.id, "UP")}
          disabled={leafIndex === 0}
          className="w-5 h-5 flex items-center justify-center text-brand-text/30 hover:text-brand-text disabled:opacity-20 transition-colors rounded"
        >
          <span className="material-symbols-rounded" style={{ fontSize: "0.8rem" }}>expand_less</span>
        </button>
        <button
          onClick={() => onMoveLeaf(chapterId, leaf.id, "DOWN")}
          disabled={leafIndex === leafCount - 1}
          className="w-5 h-5 flex items-center justify-center text-brand-text/30 hover:text-brand-text disabled:opacity-20 transition-colors rounded"
        >
          <span className="material-symbols-rounded" style={{ fontSize: "0.8rem" }}>expand_more</span>
        </button>
        <button
          onClick={() => onDeleteLeaf(chapterId, leaf)}
          className="w-5 h-5 flex items-center justify-center text-brand-text/20 hover:text-red-400 transition-colors rounded"
        >
          <span className="material-symbols-rounded" style={{ fontSize: "0.8rem" }}>delete</span>
        </button>
      </div>
    </div>
  );
}
