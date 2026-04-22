"use client";
import { useState } from "react";
import { Student } from "@/lib/classes/types";
import Avatar from "@/components/class-ui/Avatar";
import Badge from "@/components/class-ui/Badge";

type Props = {
  students: Student[];
  studentCount: number;
  onAddClick: () => void;
  onRemoveClick: (student: Student) => void;
};

export default function StudentList({ students, studentCount, onAddClick, onRemoveClick }: Props) {
  const [search, setSearch] = useState("");

  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase();
    return !q || `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
  });

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border px-5 py-4">
        <div>
          <h2 className="text-sm font-black text-brand-text">Students</h2>
          <p className="text-xs text-brand-muted mt-0.5">{studentCount} enrolled</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students…"
            className="w-52 rounded-xl border border-brand-border bg-brand-mid px-4 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition"
          />
          <button onClick={onAddClick} className="bg-brand-primary hover:opacity-90 transition text-white rounded-xl px-4 py-2 text-sm font-bold">
            Add student
          </button>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="py-12 text-center text-sm text-brand-muted">No students found.</div>
      ) : (
        <ul className="divide-y divide-brand-border">
          {filteredStudents.map((student) => (
            <li key={student.id} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-brand-mid/40 transition group">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={`${student.firstName} ${student.lastName}`} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-brand-text truncate">{student.firstName} {student.lastName}</p>
                  <p className="text-xs text-brand-muted truncate">{student.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge status={student.status} />
                <button
                  onClick={() => onRemoveClick(student)}
                  className="opacity-0 group-hover:opacity-100 rounded-lg border border-[rgb(var(--error-border))] bg-[rgb(var(--error-bg))] px-2.5 py-1.5 text-xs font-semibold text-[rgb(var(--error-text))] transition"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}