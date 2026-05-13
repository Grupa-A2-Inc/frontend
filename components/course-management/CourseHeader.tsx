"use client";

import { Loader2 } from "lucide-react"; // iconita animata din lucide-react, folosita pentru starea de loading
import { getApiErrorMessage } from "@/lib/api/errors";
import { useGetCourseFullViewQuery } from "@/store/api/coursesApi";

export default function CourseHeader({ courseId }: { courseId: string }) {
    const { data: course, isLoading: loading, error } = useGetCourseFullViewQuery(courseId);
    const chapters = course?.chapters ?? [];
    const testCount = chapters
        .flatMap((chapter) => chapter.lessons)
        .filter((lesson) => lesson.testId)
        .length;

    /* 
        --------------------------------------------------
        STARE: LOADING
        --------------------------------------------------
    */
    if (loading) {
        return (
            <div className="rounded-xl border border-brand-border bg-brand-card p-4 flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-brand-muted" />
                <span className="text-brand-muted">Loading course details...</span>
            </div>
        );
    }

    /* 
        --------------------------------------------------
        STARE: EROARE
        --------------------------------------------------
    */
    if (error || !course) {
        return (
            <div className="rounded-xl border border-red-500 bg-red-950/30 p-4 text-red-300">
                {error ? getApiErrorMessage(error) : "Failed to load course details."}
            </div>
        );
   }

    /*
        --------------------------------------------------
        CALCULAM STATISTICI
        --------------------------------------------------

        - totalLessons -> suma lectiilor din toate capitolele
        - tests.length -> numarul total de teste asociate lectiilor
    */
    const totalLessons = chapters.reduce(
        (acc, chapter) => acc + chapter.lessons.length,
        0
    );

    /*
        --------------------------------------------------
        RENDER FINAL
        --------------------------------------------------
    */
    return (
        <div className="rounded-xl border border-brand-border bg-brand-card p-6 shadow-sm">
            {/* TITLU CURS */}
            <h2 className="text-xl font-bold text-brand-text">{course.title}</h2>

            {/* DESCRIERE CURS */}
            <p className="mt-1 text-sm text-brand-muted">{course.description}</p>

            {/* GRID CU STATISTICI */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Stat label="Chapters" value={chapters.length} />
                <Stat label="Lessons" value={totalLessons} />
                <Stat label="Tests" value={testCount} />
                <Stat label="Status" value={course.status} />
            </div>
        </div>
   );
}

/*
    --------------------------------------------------
    COMPONENTA PENTRU AFISAREA UNEI STATISTICI
    --------------------------------------------------

    - label -> numele statisticii (ex: "Chapters")
    - value -> valoarea statisticii (ex: 5)
    - UI consistent cu restul dashboard-ului
*/
function Stat({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-lg bg-brand-bg p-3 border border-brand-border">
            <div className="text-xs text-brand-muted">{label}</div>
            <div className="text-lg font-semibold text-brand-text">{value}</div>
        </div>
    );
}
