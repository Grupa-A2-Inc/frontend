"use client"

import { useState } from "react";
import Link from "next/link";
import {
    ChevronDown,
    ChevronRight,
    FileText,
    FlaskConical,
    Loader2,
} from "lucide-react";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useGetCourseFullViewQuery } from "@/store/api/coursesApi";

export default function ContentTree({ courseId }: { courseId: string }) {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const { data: course, isLoading: loading, error } = useGetCourseFullViewQuery(courseId);
    const chapters = course?.chapters ?? [];

    /*
        --------------------------------------------------
        STARE: LOADING
        --------------------------------------------------
    */
    if (loading) {
        return (
            <div className="rounded-xl border border-brand-border bg-brand-card p-4 flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-brand-muted" />
                <span className="text-brand-muted">Loading course content...</span>
            </div>
        );
    }

    /*
        --------------------------------------------------
        STARE: EROARE
        --------------------------------------------------
    */
    if (error) {
        return (
            <div className="rounded-xl border border-red-500 bg-red-950/30 p-4 text-red-300">
                {getApiErrorMessage(error)}
            </div>
        );
    }

    /*
        --------------------------------------------------
        RENDER FINAL
        --------------------------------------------------
    */
    return (
        <div className="rounded-xl border border-brand-border bg-brand-card p-4">
            <h2 className="font-bold text-brand-text mb-4">Course Content</h2>

            <div className="flex flex-col gap-4">
                {chapters.map((chapter) => {
                    const isOpen = expanded[chapter.id];

                return (
                    <div
                        key={chapter.id}
                        className="border border-brand-border rounded-lg overflow-hidden"
                    >
                        {/* HEADER CAPITOL */}
                        <button 
                            onClick={() =>
                                setExpanded((prev) => ({ ...prev, [chapter.id]: !isOpen }))
                            }
                            className="w-full flex items-center justify-between px-4 py-3 bg-brand-bg hover:bg-brand-bg/80 transition"
                        >
                            <span className="font-semibold text-brand-text">
                                {chapter.title}
                            </span>

                            {isOpen ? (
                                <ChevronDown className="h-5 w-5 text-brand-muted" />
                            ) : (
                                <ChevronRight className="h-5 w-5 text-brand-muted" />
                            )}
                        </button>

                        {/* LECTII + TESTE */}
                        {isOpen && (
                            <div className="px-4 py-3 flex flex-col gap-3">
                                {chapter.lessons.map((lesson) => {
                                    const hasTest = Boolean(lesson.testId);

                                    return (
                                        <div 
                                            key={lesson.id}
                                            className="rounded-lg border border-brand-border p-3 bg-brand-card/50"
                                        >
                                            {/* LECTIE */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-brand-primary" />
                                                    <span className="font-medium text-brand-text">
                                                        {lesson.title}
                                                    </span>
                                                </div>

                                                <Link 
                                                    href={`/dashboard/teacher/courses/${courseId}/edit?lessonId=${lesson.id}`}
                                                    className="text-sm text-brand-primary hover:underline"
                                                >
                                                    Edit 
                                                </Link>
                                            </div>

                                            {/* TEST */}    
                                            <div className="mt-2 ml-6">
                                                {hasTest ? (
                                                    <Link 
                                                        href={`/dashboard/teacher/courses/${courseId}/tests/${lesson.testId}`}
                                                        className="flex items-center gap-2 text-sm text-brand-muted hover:text-brand-text transition"
                                                    >
                                                        <FlaskConical className="h-4 w-4 text-brand-primary" />
                                                        Test attached
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        href={`/dashboard/teacher/courses/${courseId}/test-builder`}
                                                        className="flex items-center gap-2 text-sm text-brand-primary hover:underline"
                                                    >
                                                        <FlaskConical className="h-4 w-4" />
                                                        Create test 
                                                    </Link>
                                                )}
                                            </div>
                                        </div> 
                                    );
                                })}
                            </div>
                        )}
                    </div> 
                    );
                })}
            </div>
        </div>
    );
}
