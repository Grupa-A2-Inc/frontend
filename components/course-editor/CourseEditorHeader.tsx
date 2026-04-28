import Link from "next/link";

interface CourseEditorHeaderProps {
  mode: "create" | "edit";
  courseId?: string;
  title: string;
  saving: boolean;
  saveOk: boolean;
  saveErr: string | null;
  onSave: () => void;
}

export function CourseEditorHeader({
  mode,
  courseId,
  title,
  saving,
  saveOk,
  saveErr,
  onSave,
}: CourseEditorHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-brand-primary/10 bg-brand-card flex-shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <Link
          href={mode === "edit" && courseId ? `/dashboard/teacher/courses/${courseId}` : "/dashboard/teacher"}
          className="flex items-center gap-1 text-sm text-brand-muted hover:text-brand-text transition-colors flex-shrink-0"
        >
          <span className="material-symbols-rounded" style={{ fontSize: "1.1rem" }}>arrow_back</span>
          {mode === "edit" ? "Course" : "My Courses"}
        </Link>
        <span className="text-brand-primary/30 flex-shrink-0">/</span>
        <span className="text-sm font-semibold text-brand-text truncate">
          {mode === "create" ? "New Course" : title || "Edit Course"}
        </span>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {saveOk && (
          <span className="text-emerald-400 text-sm flex items-center gap-1">
            <span className="material-symbols-rounded" style={{ fontSize: "1rem" }}>check_circle</span>
            Saved
          </span>
        )}
        {saveErr && <span className="text-red-400 text-xs max-w-[200px] truncate">{saveErr}</span>}
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-rounded" style={{ fontSize: "1rem" }}>
            {saving ? "hourglass_empty" : "save"}
          </span>
          {mode === "create" ? (saving ? "Creating..." : "Create Course") : (saving ? "Saving..." : "Save Course")}
        </button>
      </div>
    </header>
  );
}
