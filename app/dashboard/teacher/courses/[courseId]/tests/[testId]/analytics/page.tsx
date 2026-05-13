"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import TestAnalytics from "@/components/tests/TestAnalytics";

type Props = {
  params: Promise<{
    courseId: string;
    testId: string;
  }>;
};

export default function TestAnalyticsPage({ params }: Props) {
  const { courseId, testId } = use(params);

  return (
    <main className="min-h-screen bg-brand-bg px-6 py-8 text-brand-text">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/dashboard/teacher/courses/${courseId}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-brand-muted transition hover:text-brand-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to course
        </Link>

        <TestAnalytics testId={testId} />
      </div>
    </main>
  );
}
