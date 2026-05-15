"use client";

import Link from "next/link";
import { AlertCircle, BookOpen, ChevronRight, Loader2 } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useGetMyAvailableTestsQuery } from "@/store/api/testsApi";

export default function StudentTests() {
  const { data: tests = [], isLoading, error } = useGetMyAvailableTestsQuery();

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
        <h1 className="text-2xl font-bold text-brand-text">My Tests</h1>
        <p className="text-sm text-brand-muted mt-1">
          Tests are grouped by the lessons in your enrolled courses.
        </p>
      </div>

      {tests.length === 0 ? (
        <div className="border border-dashed border-brand-border rounded-xl p-10 text-center text-brand-muted">
          No published lesson tests were found in your courses yet.
        </div>
      ) : (
        <div className="space-y-3">
          {tests.map((test) => (
            <Link
              key={test.testId}
              href={`/dashboard/student/test-attempt?courseId=${test.courseId}&testId=${test.testId}`}
              className="bg-brand-card border border-brand-border hover:border-brand-primary/50 rounded-xl p-5 flex items-center justify-between gap-4 transition-colors"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div className="h-11 w-11 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                  <BookOpen size={22} />
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-brand-text truncate">
                    {test.lessonTitle}
                  </h2>
                  <p className="text-sm text-brand-muted truncate">
                    {test.courseTitle} / {test.chapterTitle}
                  </p>
                </div>
              </div>
              <ChevronRight className="text-brand-muted shrink-0" size={20} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
