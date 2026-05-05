"use client";

import Link from "next/link";
import { PlayCircle, CheckCircle2 } from "lucide-react";

interface LessonSidebarProps {
  chapters: any[];
  courseId: string;
  activeLessonId: string;
}

export default function LessonSidebar({ chapters, courseId, activeLessonId }: LessonSidebarProps) {
  return (
    <div className="bg-brand-card border border-brand-border rounded-xl p-5 sticky top-6 shadow-sm">
      <h3 className="text-sm font-bold text-brand-muted uppercase tracking-wider mb-4">Course Content</h3>
      
      <div className="space-y-6">
        {chapters.map((chapter: any) => (
          <div key={chapter.id} className="space-y-2">
            <h4 className="text-sm font-medium text-white">{chapter.title}</h4>
            <div className="flex flex-col gap-1">
              {chapter.lessons?.map((lesson: any, index: number) => {
                const isActive = lesson.id === activeLessonId;
                
                return (
                  <Link
                    key={lesson.id}
                    href={`/dashboard/student/courses/${courseId}/lessons/${lesson.id}`}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                      isActive 
                        ? "bg-[#6366f1]/10 border-[#6366f1]/30 text-[#6366f1]" 
                        : "bg-brand-bg border-transparent text-brand-muted hover:bg-brand-mid/40 hover:text-white"
                    }`}
                  >
                    <div className="mt-0.5">
                      {isActive ? <PlayCircle size={16} /> : <CheckCircle2 size={16} className="opacity-50" />}
                    </div>
                    <span className={`text-sm font-medium leading-tight ${isActive ? "text-white" : ""}`}>
                      {index + 1}. {lesson.title}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}