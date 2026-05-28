"use client";

import { useEffect, use } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { 
  BarChart3, 
  ChevronLeft, 
  Target, 
  Award, 
  Activity, 
  AlertCircle,
  BookOpen,
  CheckCircle2,
  TrendingDown
} from "lucide-react";
import { fetchStudentCourseStats } from "@/store/slices/analyticsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCourseDetails } from "@/store/slices/coursesSlice";
import {
  countCourseTests,
  resolveStudentTestTotals,
  type CourseTestSource,
} from "@/lib/analytics/courseStats";
import type { AttemptDetails, DifficultyLesson } from "@/lib/analytics/types";

export default function StudentStatsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const dispatch = useAppDispatch();
  const { studentStats, loading } = useAppSelector((state) => state.analytics);
  const token = useAppSelector((state) => state.auth.accessToken);
  const currentCourse = useAppSelector((state) => state.courses.currentCourse);

  useEffect(() => {
    if (courseId) {
      dispatch(fetchStudentCourseStats(courseId));
    }
  }, [courseId, dispatch]);

  useEffect(() => {
    if (!courseId || !token) return;
    if (currentCourse?.id === courseId) return;

    dispatch(fetchCourseDetails({ token, courseId }));
  }, [courseId, currentCourse, dispatch, token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 animate-pulse">Calculating your progress...</p>
      </div>
    );
  }

  if (!studentStats) {
     return (
        <div className="p-8 text-center text-slate-500">
           <AlertCircle className="mx-auto mb-2 text-slate-400" />
           <p>Could not load statistics at this time.</p>
        </div>
     );
  }

  const actualTestCount =
    currentCourse?.id === courseId
      ? countCourseTests(currentCourse as CourseTestSource)
      : undefined;
  const testTotals = resolveStudentTestTotals(studentStats, actualTestCount);

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-8 space-y-12">
      
      {/* 1. Header Section - Professional & Clean */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6 border-slate-200 dark:border-brand-border">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="text-[#6366f1]" size={32} />
            {studentStats.courseTitle || "Course Analytics"}
          </h1>
          <p className="text-slate-500 mt-1">An overview of your learning performance.</p>
        </div>
        
        <Link 
          href={`/dashboard/student/courses/${courseId}`}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-brand-muted hover:text-[#6366f1] group transition-colors border p-2 px-3 rounded-lg bg-white dark:bg-brand-card"
        >
          <ChevronLeft size={18} />
          Back to course
        </Link>
      </div>

      {/* 2. Key Metrics - Clean grid with subtle styling */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<Target className="text-blue-600" />} 
          label="Average Score" 
          value={formatScore(studentStats.averageScore)}
          suffix="%"
        />
        <StatCard 
          icon={<Award className="text-amber-600" />} 
          label="Best Score" 
          value={formatScore(studentStats.bestScore)}
          suffix="%"
        />
        <StatCard 
          icon={<Activity className="text-emerald-600" />} 
          label="Tests Done" 
          value={testTotals.done}
          suffix={`/ ${testTotals.total}`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<CheckCircle2 className="text-emerald-600" />}
          label="Tests Passed"
          value={testTotals.passed}
          suffix="passed"
        />
        <StatCard
          icon={<TrendingDown className="text-red-500" />}
          label="Lowest Score"
          value={formatScore(studentStats.lowestScore)}
          suffix="%"
        />
        <StatCard
          icon={<Activity className="text-indigo-600" />}
          label="Recent Attempts"
          value={studentStats.lastAttempts?.length ?? 0}
          suffix="shown"
        />
      </div>

      {/* 3. Detailed Section - Difficulty Lessons */}
      <div className="bg-white dark:bg-brand-card border border-slate-200 dark:border-brand-border rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-red-50 dark:bg-red-950/50 rounded-xl border border-red-100 dark:border-red-900">
            <AlertCircle className="text-red-500" size={24} />
          </div>
          <div>
            <h2 className="font-bold text-xl text-slate-900 dark:text-white">Areas Requiring Attention</h2>
            <p className="text-slate-500 text-sm mt-1">Top lessons where your scores were below average.</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {studentStats.difficultyLessons && studentStats.difficultyLessons.length > 0 ? (
            studentStats.difficultyLessons.map((lesson: DifficultyLesson) => (
              <div key={lesson.lessonId} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-brand-bg rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-brand-border transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white dark:bg-brand-card border rounded-lg text-slate-400">
                    <BookOpen size={18} />
                  </div>
                  <span className="text-base font-semibold text-slate-800 dark:text-white">{lesson.lessonTitle}</span>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <ScorePill label="My best" value={lesson.myBestScore} tone="red" />
                  <ScorePill label="Class avg" value={lesson.classAverage} tone="slate" />
                  <ScorePill label="Gap" value={lesson.gap} tone="amber" />
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-slate-400 italic bg-slate-50 dark:bg-brand-bg rounded-xl border border-dashed">
                No difficult lessons identified yet. Keep up the great work!
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-brand-card border border-slate-200 dark:border-brand-border rounded-2xl p-8 shadow-sm">
        <div className="mb-8">
          <h2 className="font-bold text-xl text-slate-900 dark:text-white">Recent Attempts</h2>
          <p className="text-slate-500 text-sm mt-1">Your latest completed test results in this course.</p>
        </div>

        <div className="space-y-3">
          {studentStats.lastAttempts && studentStats.lastAttempts.length > 0 ? (
            studentStats.lastAttempts.map((attempt: AttemptDetails) => (
              <div
                key={attempt.attemptId}
                className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-brand-border dark:bg-brand-bg sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{attempt.testTitle}</p>
                  <p className="text-xs text-slate-500">
                    {attempt.completedAt ? new Date(attempt.completedAt).toLocaleString() : "Completed attempt"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded px-2 py-1 text-xs font-semibold ${
                    attempt.passed ? "bg-green-500/10 text-green-600" : "bg-red-400/10 text-red-500"
                  }`}>
                    {attempt.passed ? "Passed" : "Not passed"}
                  </span>
                  <span className="rounded-lg bg-white px-3 py-1.5 text-sm font-extrabold text-slate-900 dark:bg-brand-card dark:text-white">
                    {formatScore(attempt.scorePercent)}%
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-slate-400 italic bg-slate-50 dark:bg-brand-bg rounded-xl border border-dashed">
              No completed attempts yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatScore(value: number | null | undefined) {
  return Number.isFinite(value) ? Number(value).toFixed(1) : "0.0";
}

function ScorePill({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "amber" | "red" | "slate";
  value: number;
}) {
  const toneClass = {
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    red: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300",
    slate: "bg-slate-200 text-slate-700 dark:bg-brand-card dark:text-brand-muted",
  }[tone];

  return (
    <span className={`text-xs font-extrabold px-3 py-1.5 rounded-lg ${toneClass}`}>
      {label}: {formatScore(value)}%
    </span>
  );
}

// Internal StatCard Component
function StatCard({
  icon,
  label,
  suffix,
  value,
}: {
  icon: ReactNode;
  label: string;
  suffix: string;
  value: number | string;
}) {
  return (
    <div className="bg-white dark:bg-brand-card border border-slate-200 dark:border-brand-border p-7 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-slate-100 dark:bg-brand-bg rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <p className="text-slate-500 text-sm font-semibold tracking-wide uppercase">{label}</p>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{value}</span>
        <span className="text-slate-400 text-base font-medium">{suffix}</span>
      </div>
    </div>
  );
}
