"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, PlayCircle, Loader2, AlertCircle } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useGetCourseFullViewQuery } from "@/store/api/coursesApi";

export default function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;
  const {
    data: currentCourse,
    isLoading: loading,
    error,
  } = useGetCourseFullViewQuery(courseId);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="animate-spin text-[#6366f1]" size={40} />
    </div>
  );

  if (error || !currentCourse) return (
    <div className="text-center py-20 text-slate-500"> 
      <AlertCircle className="mx-auto mb-2" />
      <p>{error ? getApiErrorMessage(error) : "Cursul nu a fost gasit."}</p>
    </div>
  );

  const chapters = currentCourse.chapters;
  const firstLessonId = chapters[0]?.lessons?.[0]?.id;
  const totalLessons = chapters.reduce((acc, chapter) => acc + chapter.lessons.length, 0);

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-8">
      <Link 
        href="/dashboard/student/courses" 
        className="flex items-center gap-2 text-sm text-slate-500 dark:text-brand-muted hover:text-[#6366f1] mb-6 w-fit transition-colors" 
      >
        <ChevronLeft size={16} />
        Back to courses
      </Link>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Course Overview</h1> 
        <p className="text-slate-500 dark:text-brand-muted text-sm">Review course details and start learning.</p> 
      </div>

      {/* Info Card */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-6 mb-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{currentCourse.title}</h2> 
        <p className="text-slate-600 dark:text-brand-muted text-sm mb-6">{currentCourse.description}</p> 

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-brand-bg border border-brand-border rounded-lg p-4">
            <span className="block text-xs text-slate-500 dark:text-brand-muted mb-1">Chapters</span> 
            <span className="block text-lg font-bold text-slate-900 dark:text-white">{chapters.length}</span> 
          </div>
          <div className="bg-brand-bg border border-brand-border rounded-lg p-4">
            <span className="block text-xs text-slate-500 dark:text-brand-muted mb-1">Lessons</span> 
            <span className="block text-lg font-bold text-slate-900 dark:text-white">{totalLessons}</span> 
          </div>
          <div className="bg-brand-bg border border-brand-border rounded-lg p-4">
            <span className="block text-xs text-slate-500 dark:text-brand-muted mb-1">Teacher</span> 
            <span className="block text-lg font-bold text-slate-900 dark:text-white truncate" title={currentCourse.createdBy || "N/A"}>
              {currentCourse.createdBy || "N/A"}
            </span> 
          </div>
          <div className="bg-brand-bg border border-brand-border rounded-lg p-4">
            <span className="block text-xs text-slate-500 dark:text-brand-muted mb-1">Category</span> 
            <span className="block text-lg font-bold text-slate-900 dark:text-white truncate" title={currentCourse.category}>
              {currentCourse.category}
            </span> 
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2 bg-brand-card border border-brand-border rounded-xl p-8 shadow-sm flex flex-col justify-center items-center text-center">
          {firstLessonId ? (
            <>
              <div className="bg-[#6366f1]/10 p-5 rounded-full mb-6">
                <PlayCircle size={40} className="text-[#6366f1]" />
              </div>
              <p className="text-slate-500 dark:text-brand-muted text-sm mb-4 font-medium  tracking-wide">
                Begin your lesson here!
              </p>
              <Link 
                href={`/dashboard/student/courses/${currentCourse.id}/lessons/${firstLessonId}`}
                className="bg-[#6366f1] hover:bg-[#5558e6] text-white rounded-xl px-14 py-4 flex items-center gap-3 transition-all hover:scale-105 shadow-lg"
              >
                <span className="font-bold text-lg">START COURSE</span>
                <ChevronRight size={22} />
              </Link>
            </>
          ) : (
            <p className="text-slate-500 italic">No lessons available.</p>
          )}
        </div>

        <div className="md:col-span-1 bg-brand-card border border-brand-border rounded-xl p-2 shadow-sm flex items-center justify-center relative overflow-hidden group min-h-[260px]">
          <Image
            src="/images/imagine-neagra.png"
            alt=""
            width={240}
            height={240}
            className="h-60 w-60 object-contain dark:hidden block group-hover:scale-105 transition-transform"
          />
          <Image
            src="/images/imagine-alba.png"
            alt=""
            width={240}
            height={240}
            className="h-60 w-60 object-contain hidden dark:block group-hover:scale-105 transition-transform"
          />
        </div>
      </div>

      <div className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white mb-6">Course Content</h3>
        <div className="space-y-6">
          {chapters.length > 0 ? chapters.map((chapter) => (
            <div key={chapter.id} className="space-y-3">
              <h4 className="text-sm font-medium text-slate-500 dark:text-brand-muted px-1">{chapter.title}</h4> 
              {chapter.lessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/dashboard/student/courses/${currentCourse.id}/lessons/${lesson.id}`}
                  className="bg-brand-bg border border-brand-border hover:border-[#6366f1]/50 transition-colors rounded-lg p-4 flex justify-between items-center group"
                >
                  <span className="text-sm text-slate-900 dark:text-white font-medium">{lesson.title}</span> 
                  <ChevronRight size={18} className="text-slate-400 group-hover:text-[#6366f1] transition-colors" /> 
                </Link>
              ))}
            </div>
          )) : (
            <p className="text-slate-500 text-sm italic">There are no chapters.</p>
          )}
        </div>
      </div>
    </div>
  );
}
