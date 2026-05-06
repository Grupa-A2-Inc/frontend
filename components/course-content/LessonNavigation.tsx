"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function LessonNavigation() {
  return (
    <div className="flex justify-between items-center bg-brand-card border border-brand-border rounded-xl p-4 shadow-sm mt-6">
      <button className="flex items-center gap-2 text-sm font-medium text-brand-muted hover:text-white transition-colors px-4 py-2 hover:bg-brand-bg rounded-lg">
        <ChevronLeft size={18} />
        Previous Lesson
      </button>
      
      <button className="flex items-center gap-2 text-sm font-medium text-white bg-[#6366f1] hover:bg-[#5558e6] transition-colors px-6 py-2.5 rounded-lg shadow-md">
        Next Lesson
        <ChevronRight size={18} />
      </button>
    </div>
  );
}