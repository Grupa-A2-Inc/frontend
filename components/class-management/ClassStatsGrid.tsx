import { ClassDetails } from "@/lib/classes/types";

export default function ClassStatsGrid({ cls }: { cls: ClassDetails }) {
  const stats = [
    { label: "Students", value: cls.studentCount },
    { label: "Subject", value: cls.subject || "—" },
    { label: "Grade", value: cls.grade || "—" },
    { label: "Teacher", value: cls.teacherName || "—" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map(({ label, value }) => (
        <div key={label} className="rounded-2xl border border-brand-border bg-brand-card px-4 py-4 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary/15 text-brand-primary">
            🔹 {/* Inlocuieste cu SVG-ul dorit */}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">{label}</p>
            <p className="mt-0.5 text-base font-black text-brand-text truncate">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}