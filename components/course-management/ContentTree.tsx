"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ChevronDown,
    ChevronRight,
    FileText,
    FlaskConical,
    Loader2,
} from "lucide-react";

import { fetchCourseFullView, fetchTestsForLessons } from "@/lib/courses/api";
import { Chapter, CourseTest } from "@/lib/courses/types";

export default function ContentTree({ courseId }: { courseId: string }) {
    /*
        --------------------------------------------------
        STATE-URI LOCALE
        --------------------------------------------------

        - chapters → lista de capitole ale cursului (fiecare cu lecțiile sale)
        - tests → mapare lessonId → test (pentru acces rapid)
        - expanded → dicționar care reține ce capitole sunt expandate
        - loading → indică dacă încă încărcăm datele
        - error → mesaj de eroare dacă fetch-ul eșuează
    */
   const [chapters, setChapters] = useState<Chapter[]>([]);
   const [tests, setTests] = useState<Map<string, CourseTest>>(new Map());
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /*
        --------------------------------------------------
        EFFECT: FETCH INITIAL AL STRUCTURII CURSULUI
        --------------------------------------------------

        - aduce capitolele + lecțiile
        - extrage lecțiile care au testId
        - aduce testele asociate
        - construiește un Map pentru acces rapid la testele lecțiilor
    */

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);

                // 1. Aducem capitolele + lectiile
                const { chapters } = await fetchCourseFullView(courseId);
                setChapters(chapters);

                // 2. Extragem lectiile care au testId
                const lessonIds = chapters 
                    .flatMap((c) => c.lessons)
                    .filter((l) => l.testId)
                    .map((l) => l.id);

                // 3. Aducem testele asociate lectiilor
                const fetchedTests = await fetchTestsForLessons(lessonIds);

                // 4. Construim un Map pentru acces rapid
                const testMap = new Map<string, CourseTest>();
                fetchedTests.forEach((t) => testMap.set(t.lessonId, t));

                setTests(testMap);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to load course content."
                );
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [courseId]);

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
                {error}
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
                                    const test = tests.get(lesson.id);

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
                                                {test ? (
                                                    <Link 
                                                        href={`/dashboard/teacher/courses/${courseId}/tests/${test.id}`}
                                                        className="flex items-center gap-2 text-sm text-brand-muted hover:text-brand-text transition"
                                                    >
                                                        <FlaskConical className="h-4 w-4 text-brand-primary" />
                                                        Test: {test.title}
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        href={`/dashboard/teacher/courses/${courseId}/tests/new?lessonId=${lesson.id}`}
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