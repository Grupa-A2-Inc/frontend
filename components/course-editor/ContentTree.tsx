import Link from "next/link";
import { entityIcon } from "./helpers";
import type {
  EditorChapter,
  EditorLesson,
  EditorResource,
  MoveDirection,
  SelectedRef,
} from "./types";

interface ContentTreeProps {
  mode: "create" | "edit";
  courseId?: string;
  chapters: EditorChapter[];
  selected: SelectedRef | null;
  onSelect: (selected: SelectedRef) => void;
  onAddChapter: () => void;
  onAddLesson: (chapterId: string) => void;
  onAddResource: (chapterId: string, lessonId: string) => void;
  onMoveChapter: (id: string, direction: MoveDirection) => void;
  onMoveLesson: (chapterId: string, lessonId: string, direction: MoveDirection) => void;
  onDeleteChapter: (chapter: EditorChapter) => void;
  onDeleteLesson: (chapterId: string, lesson: EditorLesson) => void;
  onDeleteResource: (chapterId: string, lessonId: string, resource: EditorResource) => void;
}

export function ContentTree({
  mode,
  courseId,
  chapters,
  selected,
  onSelect,
  onAddChapter,
  onAddLesson,
  onAddResource,
  onMoveChapter,
  onMoveLesson,
  onDeleteChapter,
  onDeleteLesson,
  onDeleteResource,
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
            mode={mode}
            courseId={courseId}
            chapter={chapter}
            chapterIndex={chapterIndex}
            chapterCount={chapters.length}
            selected={selected}
            onSelect={onSelect}
            onAddLesson={onAddLesson}
            onAddResource={onAddResource}
            onMoveChapter={onMoveChapter}
            onMoveLesson={onMoveLesson}
            onDeleteChapter={onDeleteChapter}
            onDeleteLesson={onDeleteLesson}
            onDeleteResource={onDeleteResource}
          />
        ))}
      </div>
    </section>
  );
}

interface ChapterRowProps extends Omit<ContentTreeProps, "chapters" | "onAddChapter"> {
  chapter: EditorChapter;
  chapterIndex: number;
  chapterCount: number;
}

function ChapterRow({
  mode,
  courseId,
  chapter,
  chapterIndex,
  chapterCount,
  selected,
  onSelect,
  onAddLesson,
  onAddResource,
  onMoveChapter,
  onMoveLesson,
  onDeleteChapter,
  onDeleteLesson,
  onDeleteResource,
}: ChapterRowProps) {
  const selectedHere = selected?.kind === "chapter" && selected.id === chapter.id;

  return (
    <div className="rounded-xl border border-brand-primary/15 overflow-hidden">
      <div className={`flex items-center gap-2 px-3 py-2.5 ${selectedHere ? "bg-brand-primary/15" : "bg-brand-card"}`}>
        <button
          type="button"
          onClick={() => onSelect({ kind: "chapter", id: chapter.id })}
          className="flex min-w-0 flex-1 items-center gap-2 text-left hover:text-brand-primary transition-colors"
        >
          <span className="material-symbols-rounded text-brand-primary flex-shrink-0" style={{ fontSize: "1rem" }}>
            {entityIcon("chapter")}
          </span>
          <span className="flex-1 text-sm font-medium text-brand-text truncate min-w-0">{chapter.title || "Untitled Chapter"}</span>
        </button>
        <MoveButtons
          upDisabled={chapterIndex === 0}
          downDisabled={chapterIndex === chapterCount - 1}
          onUp={() => onMoveChapter(chapter.id, "UP")}
          onDown={() => onMoveChapter(chapter.id, "DOWN")}
          onDelete={() => onDeleteChapter(chapter)}
        />
      </div>
      <div className="border-t border-brand-primary/8">
        {chapter.lessons.map((lesson, lessonIndex) => (
          <LessonRow
            key={lesson.id}
            mode={mode}
            courseId={courseId}
            chapterId={chapter.id}
            lesson={lesson}
            lessonIndex={lessonIndex}
            lessonCount={chapter.lessons.length}
            selected={selected}
            onSelect={onSelect}
            onAddResource={onAddResource}
            onMoveLesson={onMoveLesson}
            onDeleteLesson={onDeleteLesson}
            onDeleteResource={onDeleteResource}
          />
        ))}
        <button
          onClick={() => onAddLesson(chapter.id)}
          className="flex items-center gap-1.5 px-3 py-2 pl-6 w-full text-xs text-brand-primary/70 hover:text-brand-primary transition-colors"
        >
          <span className="material-symbols-rounded" style={{ fontSize: "0.9rem" }}>add</span>
          Add Lesson
        </button>
      </div>
    </div>
  );
}

interface LessonRowProps {
  mode: "create" | "edit";
  courseId?: string;
  chapterId: string;
  lesson: EditorLesson;
  lessonIndex: number;
  lessonCount: number;
  selected: SelectedRef | null;
  onSelect: (selected: SelectedRef) => void;
  onAddResource: (chapterId: string, lessonId: string) => void;
  onMoveLesson: (chapterId: string, lessonId: string, direction: MoveDirection) => void;
  onDeleteLesson: (chapterId: string, lesson: EditorLesson) => void;
  onDeleteResource: (chapterId: string, lessonId: string, resource: EditorResource) => void;
}

function LessonRow({
  mode,
  courseId,
  chapterId,
  lesson,
  lessonIndex,
  lessonCount,
  selected,
  onSelect,
  onAddResource,
  onMoveLesson,
  onDeleteLesson,
  onDeleteResource,
}: LessonRowProps) {
  const selectedHere = selected?.kind === "lesson" && selected.id === lesson.id;
  const testAvailable = mode === "edit" && courseId && !lesson.id.startsWith("temp_");

  return (
    <div className="border-b border-brand-primary/8 last:border-b-0">
      <div className={`flex items-center gap-2 px-3 py-2 pl-6 ${selectedHere ? "bg-brand-primary/10" : "hover:bg-brand-primary/5"}`}>
        <button
          type="button"
          onClick={() => onSelect({ kind: "lesson", chapterId, id: lesson.id })}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span className="material-symbols-rounded text-brand-primary/70 flex-shrink-0" style={{ fontSize: "0.9rem" }}>
            {entityIcon("lesson")}
          </span>
          <span className="flex-1 text-xs text-brand-text truncate min-w-0">{lesson.title || "Untitled Lesson"}</span>
        </button>
        <MoveButtons
          compact
          upDisabled={lessonIndex === 0}
          downDisabled={lessonIndex === lessonCount - 1}
          onUp={() => onMoveLesson(chapterId, lesson.id, "UP")}
          onDown={() => onMoveLesson(chapterId, lesson.id, "DOWN")}
          onDelete={() => onDeleteLesson(chapterId, lesson)}
        />
      </div>
      <div className="pb-1">
        {lesson.resources.map(resource => (
          <ResourceRow
            key={resource.id}
            chapterId={chapterId}
            lessonId={lesson.id}
            resource={resource}
            selected={selected}
            onSelect={onSelect}
            onDelete={onDeleteResource}
          />
        ))}
        <div className="flex items-center gap-3 pl-12 pr-3 py-1.5">
          <button
            onClick={() => onAddResource(chapterId, lesson.id)}
            className="flex items-center gap-1 text-[11px] text-brand-primary/70 hover:text-brand-primary transition-colors"
          >
            <span className="material-symbols-rounded" style={{ fontSize: "0.8rem" }}>add</span>
            Add Resource
          </button>
          {testAvailable && (
            <Link
              href={`/dashboard/teacher/courses/${courseId}/lessons/${lesson.id}/test-builder`}
              className="flex items-center gap-1 text-[11px] text-brand-primary/70 hover:text-brand-primary transition-colors"
            >
              <span className="material-symbols-rounded" style={{ fontSize: "0.8rem" }}>quiz</span>
              {lesson.testId ? "Open Test" : "Create Test"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function ResourceRow({
  chapterId,
  lessonId,
  resource,
  selected,
  onSelect,
  onDelete,
}: {
  chapterId: string;
  lessonId: string;
  resource: EditorResource;
  selected: SelectedRef | null;
  onSelect: (selected: SelectedRef) => void;
  onDelete: (chapterId: string, lessonId: string, resource: EditorResource) => void;
}) {
  const selectedHere = selected?.kind === "resource" && selected.id === resource.id;

  return (
    <div className={`flex items-center gap-2 pl-12 pr-3 py-1.5 ${selectedHere ? "bg-brand-primary/10" : "hover:bg-brand-primary/5"}`}>
      <button
        type="button"
        onClick={() => onSelect({ kind: "resource", chapterId, lessonId, id: resource.id })}
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
      >
        <span className="material-symbols-rounded text-brand-primary/60" style={{ fontSize: "0.85rem" }}>
          {entityIcon("resource")}
        </span>
        <span className="text-[11px] text-brand-text/80 truncate">{resource.title || "Untitled Resource"}</span>
      </button>
      <button
        type="button"
        onClick={() => onDelete(chapterId, lessonId, resource)}
        className="w-5 h-5 flex items-center justify-center text-brand-text/20 hover:text-red-400 transition-colors rounded"
      >
        <span className="material-symbols-rounded" style={{ fontSize: "0.8rem" }}>delete</span>
      </button>
    </div>
  );
}

function MoveButtons({
  compact = false,
  upDisabled,
  downDisabled,
  onUp,
  onDown,
  onDelete,
}: {
  compact?: boolean;
  upDisabled: boolean;
  downDisabled: boolean;
  onUp: () => void;
  onDown: () => void;
  onDelete: () => void;
}) {
  const size = compact ? "w-5 h-5" : "w-6 h-6";
  const iconSize = compact ? "0.8rem" : "0.9rem";

  return (
    <div className="flex items-center gap-0.5 flex-shrink-0">
      <button type="button" onClick={onUp} disabled={upDisabled} className={`${size} flex items-center justify-center text-brand-text/30 hover:text-brand-text disabled:opacity-20 transition-colors rounded`}>
        <span className="material-symbols-rounded" style={{ fontSize: iconSize }}>expand_less</span>
      </button>
      <button type="button" onClick={onDown} disabled={downDisabled} className={`${size} flex items-center justify-center text-brand-text/30 hover:text-brand-text disabled:opacity-20 transition-colors rounded`}>
        <span className="material-symbols-rounded" style={{ fontSize: iconSize }}>expand_more</span>
      </button>
      <button type="button" onClick={onDelete} className={`${size} flex items-center justify-center text-brand-text/20 hover:text-red-400 transition-colors rounded`}>
        <span className="material-symbols-rounded" style={{ fontSize: iconSize }}>delete</span>
      </button>
    </div>
  );
}
