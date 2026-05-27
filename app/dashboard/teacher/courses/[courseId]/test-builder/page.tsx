"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ChevronLeft } from "lucide-react";

type Props = {
  params: Promise<{ courseId: string }>;
  searchParams?: Promise<{ lessonId?: string }>;
};

export default function LegacyTestBuilderPage({ params, searchParams }: Props) {
  const { courseId } = use(params);
  const resolvedSearchParams = searchParams ? use(searchParams) : {};
  const lessonId = resolvedSearchParams.lessonId;
  const router = useRouter();

  useEffect(() => {
    if (lessonId) {
      router.replace(`/dashboard/teacher/courses/${courseId}/lessons/${lessonId}/test-builder`);
    }
  }, [courseId, lessonId, router]);

  if (lessonId) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link
        href={`/dashboard/teacher/courses/${courseId}`}
        className="mb-6 flex w-fit items-center gap-2 text-brand-muted transition-colors hover:text-brand-text"
      >
        <ChevronLeft size={20} />
        Back to course
      </Link>

      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6 text-yellow-100">
        <div className="mb-3 flex items-center gap-2 font-semibold">
          <AlertCircle size={20} />
          Select a lesson first
        </div>
        <p className="text-sm leading-6 text-yellow-100/80">
          Tests are managed one-to-one per lesson. Open Course Management and use the test action
          next to the lesson you want to edit.
        </p>
      </div>
    </div>
  );
}
