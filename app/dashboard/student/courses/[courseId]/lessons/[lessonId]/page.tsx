"use client";

import { useEffect, use } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, AlertCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchActiveLessonData, fetchCourseDetails } from "@/store/slices/coursesSlice";
import type { Chapter, LessonResource } from "@/lib/courses/types";

import LessonSidebar from "@/components/course-content/LessonSidebar";
import MarkdownViewer from "@/components/course-content/MarkdownViewer";
import PdfDownloadButton from "@/components/course-content/PdfDownloadButton";
import LessonNavigation from "@/components/course-content/LessonNavigation";
import dynamic from "next/dynamic";

const LessonRating = dynamic(
  () => import("@/components/course-content/LessonRating"),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[88px] rounded-xl border border-brand-border bg-brand-bg animate-pulse"></div>
    )
  }
);

export default function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = use(params);
  const dispatch = useAppDispatch();

  const {
    currentCourse,
    activeLesson,
    activeLessonResources,
    isLoadingLesson,
    error,
  } = useAppSelector((state) => state.courses);

  const token = useAppSelector((state) => state.auth.accessToken);

  useEffect(() => {
    if (!token) return;

    dispatch(fetchActiveLessonData({ token, lessonId }));

    if (!currentCourse || currentCourse.id !== courseId) {
      dispatch(fetchCourseDetails({ token, courseId }));
    }
  }, [dispatch, lessonId, courseId, token, currentCourse]);

  if (isLoadingLesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="animate-spin text-[#6366f1]" size={40} />
        <p className="text-brand-muted">Lesson is loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-red-400">
        <AlertCircle size={40} />
        <p>{error}</p>
      </div>
    );
  }

  const courseWithChapters = currentCourse as typeof currentCourse & {
    chapters?: Chapter[];
  };

  const chapters = courseWithChapters?.chapters ?? [];
  const resources = activeLessonResources as LessonResource[];

  const orderedLessons = chapters
    .toSorted(
      (firstChapter, secondChapter) =>
        firstChapter.orderIndex - secondChapter.orderIndex
    )
    .flatMap((chapter) =>
      (chapter.lessons ?? []).toSorted(
        (firstLesson, secondLesson) =>
          firstLesson.orderIndex - secondLesson.orderIndex
      )
    );

  const activeLessonIndex = orderedLessons.findIndex(
    (lesson) => lesson.id === lessonId
  );

  const previousLessonId =
    activeLessonIndex > 0 ? orderedLessons[activeLessonIndex - 1]?.id : undefined;

  const nextLessonId =
    activeLessonIndex >= 0 ? orderedLessons[activeLessonIndex + 1]?.id : undefined;

  return (
    <div className="max-w-[1400px] mx-auto p-4 lg:p-6 flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-[320px] shrink-0">
        <Link
          href={`/dashboard/student/courses/${courseId}`}
          className="flex items-center gap-2 text-sm text-brand-muted hover:text-white mb-6 w-fit transition-colors"
        >
          <ChevronLeft size={16} />
          Back to course overview
        </Link>

        <LessonSidebar
          chapters={chapters}
          courseId={courseId}
          activeLessonId={lessonId}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-brand-card border border-brand-border rounded-xl p-6 lg:p-10 shadow-sm flex-1">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
              {activeLesson?.title}
            </h1>
            <p className="text-brand-muted text-sm">Go through the material.</p>
          </div>

          <div className="bg-brand-bg border border-brand-border rounded-xl p-6 md:p-8 min-h-[400px] mb-8">
            <MarkdownViewer content={activeLesson?.contentMarkdown ?? ""} />
          </div>

          {resources.length > 0 && (
            <div className="mb-10">
              <h3 className="text-sm font-bold text-brand-muted uppercase mb-4">
                Resources
              </h3>

              <div className="flex flex-col gap-2">
                {resources.map((resource) => (
                  <PdfDownloadButton
                    key={resource.id}
                    url={resource.url}
                    title={resource.title}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-brand-border">
             <LessonRating lessonId={lessonId} />
          </div>
          
        </div>

        <LessonNavigation
          courseId={courseId}
          previousLessonId={previousLessonId}
          nextLessonId={nextLessonId}
        />
      </div>
    </div>
  );
}