"use client";

import { useEffect, use, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  Users,
  ChevronLeft,
  GraduationCap,
  Trophy,
  Search,
  AlertCircle
} from "lucide-react";
import { fetchTeacherCatalog } from "@/store/slices/analyticsSlice";
import type { StudentAverage } from "@/lib/analytics/types";
import { fetchTeacherStudentDirectory } from "@/lib/courses/api";
import type { OrganizationUser } from "@/lib/courses/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const PAGE_SIZE = 10;

function formatScore(value?: number) {
  if (typeof value !== "number") return "—";
  return `${Math.round(value)}%`;
}

function formatStudentAverage(student: StudentAverage) {
  if (student.testCount <= 0) return "—";
  return formatScore(student.averageScore);
}

function getDirectoryName(user?: OrganizationUser) {
  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
  return fullName || user?.email;
}

function getStudentDisplay(
  student: StudentAverage,
  directoryById: Map<string, OrganizationUser>,
) {
  const user = directoryById.get(student.studentId);
  const name = getDirectoryName(user) || `Student ${student.studentId.slice(0, 8)}`;

  return {
    name,
    email: user?.email,
  };
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "S";
}

export default function TeacherAnalyticsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [studentDirectory, setStudentDirectory] = useState<OrganizationUser[]>([]);
  
  const { teacherCatalog, loading, error } = useAppSelector((state) => state.analytics);

  useEffect(() => {
    if (courseId) {
      dispatch(fetchTeacherCatalog({ courseId, page, size: PAGE_SIZE }));
    }
  }, [courseId, dispatch, page]);

  useEffect(() => {
    let active = true;

    fetchTeacherStudentDirectory()
      .then((directory) => {
        if (active) setStudentDirectory(directory);
      })
      .catch(() => {
        if (active) setStudentDirectory([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const directoryById = useMemo(
    () => new Map(studentDirectory.map((student) => [student.id, student])),
    [studentDirectory],
  );

  const visibleStudents = useMemo(() => {
    const students = teacherCatalog?.content ?? [];
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) return students;

    return students.filter((student) => {
      const display = getStudentDisplay(student, directoryById);
      const haystack = `${display.name} ${display.email ?? ""} ${student.studentId}`.toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [directoryById, searchQuery, teacherCatalog]);

  const studentsWithScores = visibleStudents.filter((student) => student.testCount > 0);
  const pageAverage =
    studentsWithScores.length > 0
      ? studentsWithScores.reduce((total, student) => total + student.averageScore, 0) /
        studentsWithScores.length
      : undefined;

  const totalAttempts = visibleStudents.reduce(
    (total, student) => total + student.testCount,
    0,
  );
  const totalPassed = visibleStudents.reduce(
    (total, student) => total + student.passedTests,
    0,
  );
  const passRate =
    totalAttempts > 0 ? Math.round((totalPassed / totalAttempts) * 100) : undefined;
  const totalPages = teacherCatalog?.totalPages ?? 0;

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

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

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
          label="Page Average"
          value={formatScore(pageAverage)}
          color="indigo"
        />
        <SummaryCard
          icon={<Trophy size={20} />}
          label="Pass Rate"
          value={formatScore(passRate)}
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
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
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
                <th className="px-6 py-4 font-bold text-center">Progress</th>
                <th className="px-6 py-4 font-bold text-center">Average Score</th>
                <th className="px-6 py-4 font-bold text-center">Tests Taken</th>
                <th className="px-6 py-4 font-bold text-center">Passed / Failed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-brand-border">
              {visibleStudents.length > 0 ? (
                visibleStudents.map((student: StudentAverage) => {
                  const display = getStudentDisplay(student, directoryById);

                  return (
                    <tr key={student.studentId} className="group hover:bg-slate-50/50 dark:hover:bg-brand-bg/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#6366f1]/10 text-[#6366f1] flex items-center justify-center font-bold text-xs">
                            {getInitial(display.name)}
                          </div>
                          <div>
                            <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                              {display.name}
                            </span>
                            <span className="block text-xs text-slate-500 dark:text-brand-muted">
                              {display.email ?? student.studentId}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-semibold text-slate-600 dark:text-brand-muted">
                          {formatScore(student.progressPercent)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          student.testCount <= 0 ? 'bg-slate-100 text-slate-500' :
                          student.averageScore >= 80 ? 'bg-emerald-100 text-emerald-700' :
                          student.averageScore >= 50 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {formatStudentAverage(student)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-slate-600 dark:text-brand-muted">
                          {student.testCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-slate-600 dark:text-brand-muted">
                          {student.passedTests} / {student.failedTests}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
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
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-brand-border flex justify-between items-center bg-slate-50/30">
            <span className="text-xs text-slate-500">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 border rounded text-xs disabled:opacity-50"
                disabled={page === 0}
                onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 0))}
              >
                Previous
              </button>
              <button
                className="px-3 py-1 border rounded text-xs hover:bg-white transition-colors disabled:opacity-50"
                disabled={page + 1 >= totalPages}
                onClick={() =>
                  setPage((currentPage) =>
                    Math.min(currentPage + 1, totalPages - 1),
                  )
                }
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type SummaryCardProps = {
  icon: ReactNode;
  label: string;
  value: string | number;
  color: "blue" | "indigo" | "emerald";
};

// Internal Helper Component for Summary Cards
function SummaryCard({ icon, label, value, color }: SummaryCardProps) {
  const colors: Record<SummaryCardProps["color"], string> = {
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
