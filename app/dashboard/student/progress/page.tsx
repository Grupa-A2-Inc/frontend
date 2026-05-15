"use client";

import Link from "next/link";
import { AlertCircle, BookOpenCheck, ChevronRight, Loader2 } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useGetMyProgressOverviewQuery } from "@/store/api/progressApi";

export default function StudentProgress() {
  const { data: courses = [], isLoading, error } = useGetMyProgressOverviewQuery();

  const totalCourses = courses.length;
  const completedCourses = courses.filter((course) => course.completedAt).length;
  const averageProgress = totalCourses
    ? Math.round(
        courses.reduce((sum, course) => sum + course.progressPercent, 0) / totalCourses,
      )
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-red-400 flex items-center gap-3">
        <AlertCircle size={20} />
        {getApiErrorMessage(error)}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-text">My Progress</h1>
        <p className="text-sm text-brand-muted mt-1">
          Track lesson completion across your enrolled courses.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Stat label="Courses" value={totalCourses} />
        <Stat label="Completed" value={completedCourses} />
        <Stat label="Average progress" value={`${averageProgress}%`} />
      </div>

      {courses.length === 0 ? (
        <div className="border border-dashed border-brand-border rounded-xl p-10 text-center text-brand-muted">
          No enrolled course progress is available yet.
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <Link
              key={course.courseId}
              href={`/dashboard/student/courses/${course.courseId}`}
              className="block bg-brand-card border border-brand-border hover:border-brand-primary/50 rounded-xl p-5 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="h-11 w-11 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                    <BookOpenCheck size={22} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-brand-text truncate">
                      {course.courseTitle}
                    </h2>
                    <p className="text-sm text-brand-muted">
                      {course.visitedLessons} / {course.totalLessons} lessons visited
                    </p>
                  </div>
                </div>
                <ChevronRight className="text-brand-muted shrink-0" size={20} />
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-brand-muted">Progress</span>
                  <span className="font-medium text-brand-text">
                    {Math.round(course.progressPercent)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-brand-bg overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-primary"
                    style={{ width: `${Math.min(100, Math.max(0, course.progressPercent))}%` }}
                  />
                </div>
              </div>

              {course.lessons.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {course.lessons.slice(0, 6).map((lesson) => (
                    <span
                      key={lesson.lessonId}
                      className={`text-xs rounded-full px-2 py-1 ${
                        lesson.visited
                          ? "bg-green-500/10 text-green-500"
                          : "bg-brand-bg text-brand-muted"
                      }`}
                    >
                      {lesson.title ?? "Lesson"}
                    </span>
                  ))}
                  {course.lessons.length > 6 && (
                    <span className="text-xs rounded-full px-2 py-1 bg-brand-bg text-brand-muted">
                      +{course.lessons.length - 6} more
                    </span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-brand-card border border-brand-border rounded-xl p-5">
      <span className="text-xs uppercase text-brand-muted">{label}</span>
      <p className="text-2xl font-bold text-brand-text mt-1">{value}</p>
    </div>
  );
}
