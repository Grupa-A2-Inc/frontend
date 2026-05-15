"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Brain, ChevronDown, Hash } from "lucide-react";
import mlData from "@/public/ml-tests.json";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useStartAdaptiveSessionMutation } from "@/store/api/adaptiveApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setSubject,
  setTopic,
  setQuestionCount,
  setSession,
} from "@/store/slices/adaptiveSlice";

export default function AdaptivePickerPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { selectedSubjectId, selectedTopicId, questionCount } =
    useAppSelector((s) => s.adaptive);
  const [startAdaptiveSession, { isLoading, error }] = useStartAdaptiveSessionMutation();

  const subjects = mlData.subjects;
  const topics = useMemo(
    () =>
      selectedSubjectId !== null
        ? mlData.topics.filter((t) => t.subject_id === selectedSubjectId)
        : [],
    [selectedSubjectId]
  );

  const canStart = selectedSubjectId !== null && selectedTopicId !== null && !isLoading;

  async function handleStart() {
    if (!canStart || selectedSubjectId === null || selectedTopicId === null) return;

    try {
      const session = await startAdaptiveSession({
        subjectId: selectedSubjectId,
        topicId: selectedTopicId,
        count: questionCount,
      }).unwrap();
      dispatch(setSession(session));
      router.push("/dashboard/student/adaptive/test");
    } catch {
      // RTK Query exposes the normalized error below.
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
              <Brain size={22} />
            </div>
            <h1 className="text-3xl font-bold text-brand-text">Adaptive Learning</h1>
          </div>
          <p className="text-brand-muted text-sm mt-1">
            Pick a subject and topic — we will generate a personalised quiz just for you.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {/* Subject picker */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-sm">
            <label className="block text-sm font-semibold text-brand-text mb-3">
              Subject
            </label>
            <div className="relative">
              <select
                value={selectedSubjectId ?? ""}
                onChange={(e) => dispatch(setSubject(Number(e.target.value)))}
                className="w-full appearance-none bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:border-brand-primary focus:outline-none pr-10 transition"
              >
                <option value="" disabled>
                  Choose a subject...
                </option>
                {subjects.map((s) => (
                  <option key={s.subject_id} value={s.subject_id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
              />
            </div>
          </div>

          {/* Topic picker */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-sm">
            <label className="block text-sm font-semibold text-brand-text mb-3">
              Topic
            </label>
            {selectedSubjectId === null ? (
              <p className="text-brand-muted text-sm py-3">Select a subject first.</p>
            ) : topics.length === 0 ? (
              <p className="text-brand-muted text-sm py-3">
                No topics available for this subject.
              </p>
            ) : (
              <div className="relative">
                <select
                  value={selectedTopicId ?? ""}
                  onChange={(e) => dispatch(setTopic(Number(e.target.value)))}
                  className="w-full appearance-none bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:border-brand-primary focus:outline-none pr-10 transition"
                >
                  <option value="" disabled>
                    Choose a topic...
                  </option>
                  {topics.map((t) => (
                    <option key={t.topic_id} value={t.topic_id}>
                      Grade {t.grade} — {t.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
                />
              </div>
            )}
          </div>

          {/* Question count */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-sm">
            <label className="block text-sm font-semibold text-brand-text mb-3">
              Number of questions
              <span className="ml-2 text-brand-primary font-bold">{questionCount}</span>
            </label>
            <div className="flex items-center gap-4">
              <Hash size={18} className="text-brand-muted flex-shrink-0" />
              <input
                type="range"
                min={3}
                max={15}
                value={questionCount}
                onChange={(e) => dispatch(setQuestionCount(Number(e.target.value)))}
                className="flex-1 accent-brand-primary"
              />
              <span className="text-brand-muted text-sm w-8 text-right">{questionCount}</span>
            </div>
            <div className="flex justify-between text-xs text-brand-muted mt-1 px-6">
              <span>3</span>
              <span>15</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-4 text-red-400 text-sm">
              {getApiErrorMessage(error)}
            </div>
          )}

          <button
            onClick={handleStart}
            disabled={!canStart}
            className="bg-brand-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-primary/90 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generating session...
              </>
            ) : (
              <>
                <Brain size={18} />
                Start session
              </>
            )}
          </button>
        </div>

        {/* Info sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 bg-brand-card border border-brand-border rounded-xl p-5 shadow-sm">
            <h4 className="text-xs font-bold text-brand-muted mb-4 uppercase tracking-wider">
              How it works
            </h4>
            <ol className="space-y-3 text-sm text-brand-muted list-none">
              {[
                "Pick your subject and topic",
                "Choose how many questions you want",
                "The AI generates a personalised quiz",
                "Answer the questions at your own pace",
                "Review your score and correct answers",
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-brand-primary/10 text-brand-primary text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
