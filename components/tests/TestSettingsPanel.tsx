"use client";

import { useEffect, useMemo } from "react";
import { Bot, Loader2 } from "lucide-react";
import { useGetCourseFullViewQuery } from "@/store/api/coursesApi";

type Props = {
  courseId: string;
  selectedLessonId: string;
  questionCount: number;
  isGenerating: boolean;
  onLessonChange: (lessonId: string) => void;
  onQuestionCountChange: (count: number) => void;
  onGenerate: () => void;
};

export default function TestSettingsPanel({
  courseId,
  selectedLessonId,
  questionCount,
  isGenerating,
  onLessonChange,
  onQuestionCountChange,
  onGenerate,
}: Props) {
  const { data: course, isLoading: loadingChapters } = useGetCourseFullViewQuery(courseId);
  const chapters = useMemo(() => course?.chapters ?? [], [course?.chapters]);
  const lessons = useMemo(
    () => chapters.flatMap((chapter) => chapter.lessons),
    [chapters],
  );

  useEffect(() => {
    if (!selectedLessonId && lessons[0]?.id) {
      onLessonChange(lessons[0].id);
    }
  }, [lessons, onLessonChange, selectedLessonId]);

  return (
    <div className="bg-brand-card border border-brand-border p-6 rounded-xl shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        
        <div className="flex-1 w-full">
          <label className="text-xs font-medium text-brand-muted mb-1 block uppercase tracking-wider">SOURCE CONTENT</label>
          <select 
            value={selectedLessonId}
            onChange={(e) => onLessonChange(e.target.value)}
            disabled={loadingChapters || isGenerating}
            className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-2.5 text-brand-text focus:border-brand-primary outline-none transition disabled:opacity-60"
          >
            <option value="">{loadingChapters ? "Loading..." : "Select a lesson"}</option>
            {chapters.map((chapter) => (
              <optgroup key={chapter.id} label={chapter.title}>
                {chapter.lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-32">
          <label className="text-xs font-medium text-brand-muted mb-1 block uppercase tracking-wider">QUESTIONS</label>
          <input 
            type="number" 
            value={questionCount}
            onChange={(e) => onQuestionCountChange(clampQuestionCount(Number(e.target.value)))}
            min={1} max={50} 
            disabled={isGenerating}
            className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-2.5 text-brand-text focus:border-brand-primary outline-none transition disabled:opacity-60" 
          />
        </div>

        <button 
          onClick={onGenerate}
          disabled={isGenerating || loadingChapters || !selectedLessonId}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium disabled:opacity-50 transition"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Bot size={20} />}
          {isGenerating ? "Generating..." : "Generate AI"}
        </button>
      </div>
    </div>
  );
}

function clampQuestionCount(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.min(50, Math.max(1, value));
}
