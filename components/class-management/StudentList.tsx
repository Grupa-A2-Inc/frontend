"use client";
import { useState } from "react";
import { ClassMember } from "@/lib/classes/types";
import Avatar from "@/components/class-ui/Avatar";

type Props = {
  members: ClassMember[];
  onAddClick: () => void;
  onRemoveClick: (member: ClassMember) => void;
};

export default function StudentList({ members, onAddClick, onRemoveClick }: Props) {
  const [search, setSearch] = useState("");

  const students = members.filter((m) => m.membershipType === "STUDENT");
  const filtered = students.filter((m) => {
    const q = search.toLowerCase();
    return !q || m.email.toLowerCase().includes(q);
  });

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">Members</p>
          <p className="text-sm text-brand-text mt-0.5">{students.length} enrolled</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email…"
            className="w-52 rounded-xl border border-brand-border bg-brand-mid px-4 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition"
          />
          <button onClick={onAddClick} className="bg-brand-primary hover:opacity-90 transition text-white rounded-xl px-4 py-2 text-sm font-bold">
            Add member
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-brand-muted">
          {students.length === 0 ? "No students yet. Add one above." : "No students match your search."}
        </div>
      ) : (
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          <ul className="divide-y divide-brand-border">
            {filtered.map((member) => (
              <li key={member.userId} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-brand-mid/40 transition group">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={member.email} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-brand-text truncate">{member.email}</p>
                    <p className="text-xs text-brand-muted capitalize">{member.membershipType.toLowerCase()}</p>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveClick(member)}
                  className="opacity-0 group-hover:opacity-100 rounded-lg border border-red-400/30 bg-red-400/10 px-2.5 py-1.5 text-xs font-semibold text-red-400 transition"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
