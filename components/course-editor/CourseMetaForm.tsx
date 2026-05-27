interface CourseMetaFormProps {
  title: string;
  description: string;
  category: string;
  status: "DRAFT" | "PUBLISHED";
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: "DRAFT" | "PUBLISHED") => void;
}

export function CourseMetaForm({
  title,
  description,
  category,
  status,
  onTitleChange,
  onDescriptionChange,
  onCategoryChange,
  onStatusChange,
}: CourseMetaFormProps) {
  return (
    <section className="p-5 border-b border-brand-primary/10">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-muted mb-4">Course Details</p>
      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-xs font-medium text-brand-text/60 mb-1.5">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={e => onTitleChange(e.target.value)}
            placeholder="e.g. Introduction to Mathematics"
            className="w-full bg-brand-card border border-brand-primary/20 rounded-xl px-3 py-2 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-brand-text/60 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={e => onDescriptionChange(e.target.value)}
            placeholder="Brief description of the course..."
            rows={3}
            className="w-full bg-brand-card border border-brand-primary/20 rounded-xl px-3 py-2 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-brand-text/60 mb-1.5">
            Category <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={category}
            onChange={e => onCategoryChange(e.target.value)}
            placeholder="e.g. Mathematics, Science, History"
            className="w-full bg-brand-card border border-brand-primary/20 rounded-xl px-3 py-2 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-brand-text/60 mb-1.5">Status</label>
          <div className="flex items-center gap-1 bg-brand-mid border border-brand-primary/20 rounded-xl p-1">
            <button
              type="button"
              onClick={() => onStatusChange("DRAFT")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                status === "DRAFT"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "text-brand-text/50 hover:text-brand-text"
              }`}
            >
              Draft
            </button>
            <button
              type="button"
              onClick={() => onStatusChange("PUBLISHED")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                status === "PUBLISHED"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-brand-text/50 hover:text-brand-text"
              }`}
            >
              Published
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
