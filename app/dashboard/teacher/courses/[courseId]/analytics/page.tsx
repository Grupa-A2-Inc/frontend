"use client";

import { useEffect, use } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { 
  Users, 
  ChevronLeft, 
  GraduationCap, 
  Trophy, 
  Search,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { fetchTeacherCatalog } from "@/store/slices/analyticsSlice";
import { StudentAverage } from "@/lib/analytics/types";

export default function TeacherAnalyticsPage({ params }: { params: Promise<{ courseId: string }> }) {
  // 1. Unwrap params for Next.js 15
  const { courseId } = use(params);
  const dispatch = useDispatch();
  
  const { teacherCatalog, loading } = useSelector((state: any) => state.analytics);

  useEffect(() => {
    if (courseId) {
      // We fetch page 0 by default
      dispatch(fetchTeacherCatalog({ courseId, page: 0 }) as any);
    }
  }, [courseId, dispatch]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 animate-pulse">Loading student data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-8 space-y-8">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6 border-slate-200 dark:border-brand-border">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <Users className="text-[#6366f1]" size={32} />
            Course Gradebook
          </h1>
          <p className="text-slate-500 mt-1">Manage student performance and monitor course averages.</p>
        </div>
        
        <Link 
          href={`/dashboard/teacher/courses/${courseId}`}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-brand-muted hover:text-[#6366f1] group transition-colors border p-2 px-4 rounded-lg bg-white dark:bg-brand-card shadow-sm"
        >
          <ChevronLeft size={18} />
          Back to Course
        </Link>
      </div>

      {/* 2. Quick Summary Cards (Calculated from current page) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <SummaryCard 
          icon={<Users size={20} />} 
          label="Enrolled Students" 
          value={teacherCatalog?.totalElements || "0"} 
          color="blue"
        />
        <SummaryCard 
          icon={<GraduationCap size={20} />} 
          label="Active This Page" 
          value={teacherCatalog?.content?.length || "0"} 
          color="indigo"
        />
        <SummaryCard 
          icon={<Trophy size={20} />} 
          label="Completion Rate" 
          value="High" 
          color="emerald"
        />
      </div>

      {/* 3. Student Table */}
      <div className="bg-white dark:bg-brand-card border border-slate-200 dark:border-brand-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-brand-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="font-bold text-slate-900 dark:text-white">Student Performance List</h2>
          <div className="relative w-full sm:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
                type="text" 
                placeholder="Search student..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-brand-bg border border-slate-200 dark:border-brand-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20"
             />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-brand-bg/50 text-slate-500 dark:text-brand-muted text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Student Name</th>
                <th className="px-6 py-4 font-bold text-center">Average Grade</th>
                <th className="px-6 py-4 font-bold text-center">Tests Completed</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-brand-border">
              {teacherCatalog?.content && teacherCatalog.content.length > 0 ? (
                teacherCatalog.content.map((student: StudentAverage) => (
                  <tr key={student.studentId} className="group hover:bg-slate-50/50 dark:hover:bg-brand-bg/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#6366f1]/10 text-[#6366f1] flex items-center justify-center font-bold text-xs">
                          {student.studentName.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {student.studentName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        student.averageGrade >= 8 ? 'bg-emerald-100 text-emerald-700' : 
                        student.averageGrade >= 5 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {student.averageGrade.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-slate-600 dark:text-brand-muted">
                        {student.testsPassed} / {student.totalTests}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-[#6366f1] transition-colors p-1">
                        <ArrowRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle size={24} />
                      No student data found for this course.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Placeholder */}
        {teacherCatalog?.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-brand-border flex justify-between items-center bg-slate-50/30">
            <span className="text-xs text-slate-500">Page 1 of {teacherCatalog.totalPages}</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 border rounded text-xs disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 border rounded text-xs hover:bg-white transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Internal Helper Component for Summary Cards
function SummaryCard({ icon, label, value, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };
  
  return (
    <div className="bg-white dark:bg-brand-card border border-slate-200 dark:border-brand-border p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}