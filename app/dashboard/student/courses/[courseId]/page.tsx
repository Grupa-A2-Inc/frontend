"use client";

import { useEffect, use } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, PlayCircle, Loader2, AlertCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCourseDetails, resetCurrentCourse } from "@/store/slices/coursesSlice";

export default function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;

  const dispatch = useAppDispatch();
  
  const { currentCourse, loading, error } = useAppSelector((state) => state.courses);
  
  const token = useAppSelector((state) => state.auth.accessToken); 

  useEffect(() => {
    if (courseId && token) {
      dispatch(fetchCourseDetails({ token, courseId }));
    }
    
    return () => {
      dispatch(resetCurrentCourse());
    };
  }, [dispatch, courseId, token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="animate-spin text-[#6366f1]" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-red-400">
        <AlertCircle size={40} />
        <p>{error}</p>
      </div>
    );
  }

  if (!currentCourse) {
    return (
      <div className="text-center py-20 text-brand-muted">
        Course not found.
      </div>
    );
  }

  const chapters = (currentCourse as any).chapters || [];
  const firstLessonId = chapters[0]?.lessons?.[0]?.id;
  const totalLessons = chapters.reduce((acc: number, cap: any) => acc + (cap.lessons?.length || 0), 0);

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-8">
      <Link href="/dashboard/student/courses" className="flex items-center gap-2 text-sm text-brand-muted hover:text-white mb-6 w-fit transition-colors">
        <ChevronLeft size={16} />
        Back to courses
      </Link>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Course overview</h1>
        <p className="text-brand-muted text-sm">Review course details and start learning.</p>
      </div>

      <div className="bg-brand-card border border-brand-border rounded-xl p-6 mb-6 shadow-sm">
        <h2 className="text-lg font-bold text-white mb-1">{currentCourse.title}</h2>
        <p className="text-brand-muted text-sm mb-6">{currentCourse.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-brand-bg border border-brand-border rounded-lg p-4">
            <span className="block text-xs text-brand-muted mb-1">Chapters</span>
            <span className="block text-lg font-bold text-white">{chapters.length}</span>
          </div>
          <div className="bg-brand-bg border border-brand-border rounded-lg p-4">
            <span className="block text-xs text-brand-muted mb-1">Lessons</span>
            <span className="block text-lg font-bold text-white">{totalLessons}</span>
          </div>
          <div className="bg-brand-bg border border-brand-border rounded-lg p-4">
            <span className="block text-xs text-brand-muted mb-1">Teacher</span>
            <span className="block text-lg font-bold text-white truncate" title={currentCourse.createdBy || "N/A"}>
              {currentCourse.createdBy || "N/A"}
            </span>
          </div>
          <div className="bg-brand-bg border border-brand-border rounded-lg p-4">
            <span className="block text-xs text-brand-muted mb-1">Category</span>
            <span className="block text-lg font-bold text-white truncate" title={currentCourse.category}>
              {currentCourse.category}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-brand-card border border-brand-border rounded-xl p-3 mb-6 shadow-sm">
        {firstLessonId ? (
          <Link 
            href={`/dashboard/student/courses/${currentCourse.id}/lessons/${firstLessonId}`}
            className="bg-[#6366f1] hover:bg-[#5558e6] text-white rounded-lg p-5 flex items-center gap-4 transition-colors w-full md:w-1/2"
          >
            <div className="bg-white/20 p-2 rounded-md">
              <PlayCircle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-base">Start Course</h3>
              <p className="text-white/80 text-sm">Begin learning the first chapter</p>
            </div>
          </Link>
        ) : (
          <div className="bg-brand-bg text-brand-muted rounded-lg p-5 flex items-center gap-4 border border-brand-border w-full md:w-1/2">
            <div className="bg-brand-surface p-2 rounded-md">
              <PlayCircle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-base">Course empty</h3>
              <p className="text-sm">No lessons available yet.</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-white mb-6">Course Content</h3>
        
        <div className="space-y-6">
          {chapters.length > 0 ? chapters.map((chapter: any) => (
            <div key={chapter.id} className="space-y-3">
              <h4 className="text-sm font-medium text-brand-muted px-1">
                {chapter.title}
              </h4>
              {chapter.lessons?.map((lesson: any) => (
                <Link
                  key={lesson.id}
                  href={`/dashboard/student/courses/${currentCourse.id}/lessons/${lesson.id}`}
                  className="bg-brand-bg border border-brand-border hover:border-[#6366f1]/50 transition-colors rounded-lg p-4 flex justify-between items-center group"
                >
                  <span className="text-sm text-white font-medium">{lesson.title}</span>
                  <ChevronRight size={18} className="text-brand-muted group-hover:text-white transition-colors" />
                </Link>
              ))}
            </div>
          )) : (
            <p className="text-brand-muted text-sm">There are no chapters in this course..</p>
          )}
        </div>
      </div>
    </div>
  );
}