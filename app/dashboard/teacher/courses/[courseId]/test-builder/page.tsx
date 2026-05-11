"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Save, Plus, CheckCircle2 } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { 
  saveFinalTestThunk, 
  addManualQuestion 
} from "@/store/slices/testDraftSlice";

import TestSettingsPanel from "@/components/tests/TestSettingsPanel";
import QuestionCard from "@/components/tests/QuestionCard";
import QuestionNavigator from "@/components/tests/QuestionNavigator";

type Props = {
  params: Promise<{ courseId: string }>;
  searchParams?: Promise<{ lessonId?: string }>;
};

export default function TestBuilderPage({ params, searchParams }: Props) {
  const { courseId } = use(params);
  const resolvedSearchParams = searchParams ? use(searchParams) : {};
  const initialLessonId = resolvedSearchParams.lessonId ?? "";

  const dispatch = useAppDispatch();
   
  const { questions, isSaving, status } = useAppSelector((state) => state.testDraft);
  const [selectedLessonId, setSelectedLessonId] = useState(initialLessonId);
  const [testTitle, setTestTitle] = useState("Lesson test");
  const [timeLimitSec, setTimeLimitSec] = useState<number | undefined>(undefined);

  const handleSave = () => {
    if (!selectedLessonId || !testTitle.trim()) return;
    dispatch(
      saveFinalTestThunk({
        lessonId: selectedLessonId,
        title: testTitle.trim(),
        timeLimitSec,
      })
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 pb-20">
      <Link href={`/dashboard/teacher/courses/${courseId}`} className="flex items-center gap-2 text-brand-muted hover:text-brand-text mb-6 w-fit transition-colors">
        <ChevronLeft size={20} />
        Back to course
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-text">AI Test Editor</h1>
          <p className="text-sm mt-2 flex items-center gap-2">
            {status === "PUBLISHED" ? (
              <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded font-medium flex items-center gap-1">
                <CheckCircle2 size={16} /> Test saved and published
              </span>
            ) : status === "SAVED" ? (
              <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded font-medium flex items-center gap-1">
                <CheckCircle2 size={16} /> Test saved
              </span>
            ) : status === "DRAFT" ? (
              <span className="text-red-400 bg-red-400/10 px-2 py-1 rounded font-medium">Unsaved draft</span>
            ) : (
              <span className="text-brand-muted">Choose settings for generating tests</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {questions.length > 0 && (
            <>
              <button 
                onClick={() => dispatch(addManualQuestion())}
                className="bg-brand-surface border border-brand-border text-brand-text px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-brand-mid transition font-medium w-full sm:w-auto"
              >
                <Plus size={18} /> Add question
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving || !selectedLessonId || !testTitle.trim()}
                className="bg-brand-primary text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-brand-primary/90 transition font-medium w-full sm:w-auto disabled:opacity-50"
              >
                <Save size={18} />
                {isSaving ? "Saving & publishing..." : "Save and publish"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <TestSettingsPanel
            courseId={courseId}
            selectedLessonId={selectedLessonId}
            onLessonChange={setSelectedLessonId}
            title={testTitle}
            onTitleChange={setTestTitle}
            timeLimitSec={timeLimitSec}
            onTimeLimitChange={setTimeLimitSec}
          />
          
          <div className="mt-8 space-y-6">
            {questions.map((q, index) => (
              <QuestionCard 
                key={q.id}
                question={q}
                index={index}
              />
            ))}
            
            {questions.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-brand-border rounded-xl text-brand-muted">
                No question generated yet. Use the upper panel.
              </div>
            )}
          </div>
        </div>

        <div className="relative">
          <QuestionNavigator questions={questions} />
        </div>
      </div>
    </div>
  );
}
