"use client";

import { useEffect, useState } from "react"; // hooks React pentru state local si efecte secundare
import { Loader2 } from "lucide-react"; // iconita animata din lucide-react, folosita pentru starea de loading

import { fetchCourseFullView, fetchTestsForLessons } from "@/lib/courses/api";
import { Course, Chapter, CourseTest } from "@/lib/courses/types";

export default function CourseHeader({ courseId }: { courseId: string }) {
    /*
        --------------------------------------------------
        STATE-URI LOCALE
        --------------------------------------------------

        - course -> obiectul principal al cursului (titlu, descriere, status etc.)
        - chapters -> lista de capitole, fiecare cu lectiile sale
        - tests -> lista de teste asociate lectiilor
        - loading -> indica daca inca incarcam datele
        - error -> mesaj de eroare daca fetch-ul esueaza
    */
    const [course, setCourse] = useState<Course | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [tests, setTests] = useState<CourseTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /*
        --------------------------------------------------
        EFFECT: FETCH INITIAL AL DATELOR CURSULUI
        --------------------------------------------------

        - ruleaza o singura data la montarea componentei
        - aduce cursul complet + capitolele + lectiile
        - extrage lectiile care au testId
        - aduce testele asociate
        - gestioneaza loading si error states
    */
    useEffect(() => {
        async function load() {
            try {
                setLoading(true);

                // 1. Aducem cursul + capitolele + lectiile
                const { course, chapters } = await fetchCourseFullView(courseId);
                setCourse(course);
                setChapters(chapters);

                // 2. Extragem lectiile care au testId definit
                const lessonIds = chapters
                    .flatMap((c) => c.lessons)
                    .filter((l) => l.testId)
                    .map((l) => l.id);

                // 3. Aducem testele asociate lectiilor
                const tests = await fetchTestsForLessons(lessonIds);
                setTests(tests);
            } catch (err) {
                // Convertim eroarea intr-un mesaj lizibil
                setError(
                    err instanceof Error ? err.message : "Failed to load course details."
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
                {error ?? "Failed to load course details."}
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
                <Stat label="Tests" value={tests.length} />
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