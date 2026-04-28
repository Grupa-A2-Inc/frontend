"use client";

import { useState } from "react";
import { Course } from "@/store/slices/coursesSlice";

type Props = { course: Course; onEdit: (courseId: string) => void; onManage: (courseId: string) => void; };

export default function CourseRow({ course, onEdit, onManage }: Props) {
  const [open, setOpen] = useState(false);

  const badge =
    course.status === "PUBLISHED" ? "bg-emerald-500/15 text-emerald-400" :
    course.status === "DRAFT"     ? "bg-brand-text/10 text-brand-text/50" :
                                    "bg-amber-500/15 text-amber-400";

  return (
    <div className="border-b border-brand-primary/10 hover:bg-brand-primary/5 transition-colors">
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-brand-text">{course.title}</p>
          <p className="text-xs text-brand-text/40 mt-1">{course.category}</p>
        </div>

        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge}`}>
          {course.status.charAt(0) + course.status.slice(1).toLowerCase()}
        </span>

        <div className="hidden sm:flex items-center gap-2">
          <button onClick={() => onEdit(course.id)} className="px-3 py-1.5 text-xs font-medium border border-brand-primary/20 rounded-lg text-brand-text/70 hover:text-brand-text hover:bg-brand-primary/10 transition-colors">Edit</button>
          <button onClick={() => onManage(course.id)} className="px-3 py-1.5 text-xs font-medium border border-brand-primary/20 rounded-lg text-brand-text/70 hover:text-brand-text hover:bg-brand-primary/10 transition-colors">Manage</button>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className={`sm:hidden w-9 h-9 flex items-center justify-center rounded-lg border transition-colors text-xl ${open ? "border-brand-primary text-brand-primary" : "border-brand-primary/20 text-brand-text"}`}>
          {open ? "⌃" : "⌄"}
        </button>
      </div>

      {open && (
        <div className="sm:hidden border-t border-brand-primary/10 px-3 py-2 flex flex-col gap-1">
          <button onClick={() => { onEdit(course.id); setOpen(false); }} className="text-left px-3 py-2 text-sm text-brand-text rounded-lg hover:bg-brand-primary/10 transition-colors">Edit</button>
          <button onClick={() => { onManage(course.id); setOpen(false); }} className="text-left px-3 py-2 text-sm text-brand-text rounded-lg hover:bg-brand-primary/10 transition-colors">Manage</button>
        </div>
      )}
    </div>
  );
}