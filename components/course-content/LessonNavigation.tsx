"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface LessonNavigationProps {
  chapters: any[];
  courseId: string;
  currentLessonId: string;
}

export default function LessonNavigation({ chapters, courseId, currentLessonId }: LessonNavigationProps) {
  const allLessons = chapters.flatMap(chapter => chapter.lessons || []);
const currentIndex = allLessons.findIndex(lesson => lesson.id === currentLessonId);
const prevLesson = allLessons[currentIndex - 1];
  const nextLesson = allLessons[currentIndex + 1];

 return (
    <div className="flex justify-between items-center bg-brand-card border border-brand-border rounded-xl p-4 shadow-sm mt-6">
      {prevLesson ? (
        <Link 
          href={`/dashboard/student/courses/${courseId}/lessons/${prevLesson.id}`}
          className="flex items-center gap-2 text-sm font-medium text-brand-muted hover:text-white transition-colors px-4 py-2 hover:bg-brand-bg rounded-lg"
        >
          <ChevronLeft size={18} />
          Previous Lesson
        </Link>
      ) : (
        <div /> 
      )}
      
      {nextLesson ? (
        <Link 
          href={`/dashboard/student/courses/${courseId}/lessons/${nextLesson.id}`}
          className="flex items-center gap-2 text-sm font-medium text-white bg-[#6366f1] hover:bg-[#5558e6] transition-colors px-6 py-2.5 rounded-lg shadow-md"
        >
          Next Lesson
          <ChevronRight size={18} />
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}