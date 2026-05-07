"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  courseId: string;
  previousLessonId?: string;
  nextLessonId?: string;
};

export default function LessonNavigation({
  courseId,
  previousLessonId,
  nextLessonId,
}: Props) {
  const previousHref = previousLessonId
    ? `/dashboard/student/courses/${courseId}/lessons/${previousLessonId}`
    : "";

  const nextHref = nextLessonId
    ? `/dashboard/student/courses/${courseId}/lessons/${nextLessonId}`
    : "";

  return (
    <div className="flex justify-between items-center bg-brand-card border border-brand-border rounded-xl p-4 shadow-sm mt-6">
      {previousLessonId ? (
        <Link
          href={previousHref}
          className="flex items-center gap-2 text-sm font-medium text-brand-muted hover:text-white transition-colors px-4 py-2 hover:bg-brand-bg rounded-lg"
        >
          <ChevronLeft size={18} />
          Previous Lesson
        </Link>
      ) : (
        <span className="flex items-center gap-2 text-sm font-medium text-brand-muted/40 px-4 py-2 rounded-lg cursor-not-allowed">
          <ChevronLeft size={18} />
          Previous Lesson
        </span>
      )}

      {nextLessonId ? (
        <Link
          href={nextHref}
          className="flex items-center gap-2 text-sm font-medium text-white bg-[#6366f1] hover:bg-[#5558e6] transition-colors px-6 py-2.5 rounded-lg shadow-md"
        >
          Next Lesson
          <ChevronRight size={18} />
        </Link>
      ) : (
        <span className="flex items-center gap-2 text-sm font-medium text-white/40 bg-brand-surface px-6 py-2.5 rounded-lg cursor-not-allowed">
          Next Lesson
          <ChevronRight size={18} />
        </span>
      )}
    </div>
  );
}