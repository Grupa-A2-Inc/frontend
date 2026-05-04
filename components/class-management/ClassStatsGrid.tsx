import { ClassDetails, ClassMember } from "@/lib/classes/types";
import { Users, GraduationCap, CalendarDays } from "lucide-react";

export default function ClassStatsGrid({ cls, members }: { cls: ClassDetails; members: ClassMember[] }) {
  const studentCount = members.filter((m) => m.membershipType === "STUDENT").length;
  const teacherCount = members.filter((m) => m.membershipType === "TEACHER").length;

  const stats = [
    { label: "Students", value: studentCount, icon: <Users size={18} /> },
    { label: "Teachers", value: teacherCount, icon: <GraduationCap size={18} /> },
    { label: "Created",  value: cls.createdAt ? new Date(cls.createdAt).toLocaleDateString() : "—", icon: <CalendarDays size={18} /> },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {stats.map(({ label, value, icon }) => (
        <div key={label} className="rounded-2xl border border-brand-border bg-brand-card px-4 py-4 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary/15 text-brand-primary">
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
