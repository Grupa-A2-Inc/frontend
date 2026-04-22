import { ClassDetails } from "@/lib/classes/types";
import { SquarePen, BookOpenText, CircleUser, Coffee } from "lucide-react";

export default function ClassStatsGrid({ cls }: { cls: ClassDetails }) {
  const stats = [
    { label: "ELEVI", value: cls.studentCount, icon: <CircleUser /> },
    { label: "Materie", value: cls.subject || "—", icon:<SquarePen /> },
    { label: "Clasa", value: cls.grade || "—", icon:<BookOpenText /> },
    { label: "Profesor", value: cls.teacherName || "—", icon:<Coffee /> },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map(({ label, value, icon }) => (
        <div key={label} className="rounded-2xl border border-brand-border bg-brand-card px-4 py-4 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary/15 text-brand-primary text-xl">
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted truncate">{label}</p>
            <p className="mt-0.5 text-base font-black text-brand-text truncate">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}