"use client";

import { useEffect, use } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { 
  BarChart3, 
  ChevronLeft, 
  Target, 
  Award, 
  Activity, 
  AlertCircle,
  BookOpen
} from "lucide-react";
import { fetchStudentCourseStats } from "@/store/slices/analyticsSlice";

export default function StudentStatsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const dispatch = useDispatch();
  
  // Accessing the global state
  const { studentStats, loading } = useSelector((state: any) => state.analytics);

  useEffect(() => {
    if (courseId) {
      dispatch(fetchStudentCourseStats(courseId) as any);
    }
  }, [courseId, dispatch]);

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

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-8 space-y-12">
      
      {/* 1. Header Section - Professional & Clean */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6 border-slate-200 dark:border-brand-border">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="text-[#6366f1]" size={32} />
            Course Analytics
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
          label="Average Grade" 
          value={studentStats.averageGrade?.toFixed(2) || "0.00"}
          suffix="/ 10"
        />
        <StatCard 
          icon={<Award className="text-amber-600" />} 
          label="Best Score" 
          value={studentStats.bestGrade || "0"}
          suffix="pts"
        />
        <StatCard 
          icon={<Activity className="text-emerald-600" />} 
          label="Total Attempts" 
          value={studentStats.totalAttempts || "0"}
          suffix="times"
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
            studentStats.difficultyLessons.map((lesson: any) => (
              <div key={lesson.lessonId} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-brand-bg rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-brand-border transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white dark:bg-brand-card border rounded-lg text-slate-400">
                    <BookOpen size={18} />
                  </div>
                  <span className="text-base font-semibold text-slate-800 dark:text-white">{lesson.lessonTitle}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Avg. Score:</span>
                    <span className="text-sm font-extrabold px-3 py-1.5 bg-red-100 dark:bg-red-950 text-red-600 rounded-lg">
                      {lesson.averageScore}%
                    </span>
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
    </div>
  );
}

// Internal StatCard Component
function StatCard({ icon, label, value, suffix }: any) {
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