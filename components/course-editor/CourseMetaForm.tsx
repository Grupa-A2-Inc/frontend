interface CourseMetaFormProps {
  title: string;
  description: string;
  expirationDate: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onExpirationChange: (value: string) => void;
}

export function CourseMetaForm({
  title,
  description,
  expirationDate,
  onTitleChange,
  onDescriptionChange,
  onExpirationChange,
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
            Expiration Date
            <span className="text-brand-muted/50 font-normal ml-1">(auto-archives on this date)</span>
          </label>
          <input
            type="date"
            value={expirationDate}
            onChange={e => onExpirationChange(e.target.value)}
            className="w-full bg-brand-card border border-brand-primary/20 rounded-xl px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-primary/60 transition-colors"
          />
        </div>
      </div>
    </section>
  );
}
