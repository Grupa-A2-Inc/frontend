"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchStudentProgressThunk } from "@/store/slices/takeTestSlice";
import Link from "next/link";

// --------------------------------------------------
// Pagina de progres a studentului (lista testelor date)
// --------------------------------------------------

export default function StudentProgress({ params }: any) {
  const { courseId } = params;
  const dispatch = useDispatch<AppDispatch>();

  const { progress, loading, error } = useSelector(
    (state: RootState) => state.takeTest
  );

  useEffect(() => {
    dispatch(fetchStudentProgressThunk(courseId));
  }, [dispatch, courseId]);


  // --------------------------------------------------
  // Stare de încărcare
  // --------------------------------------------------
  if (loading && !progress) {
    return <p className="text-center mt-10">Loading progress...</p>;
  }

  // --------------------------------------------------
  // Stare de eroare
  // --------------------------------------------------
  if (error) {
    return (
      <div className="text-center mt-10 text-red-600">
        <p>Error: {error}</p>
        <button
          onClick={() => dispatch(fetchStudentProgressThunk(courseId))}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  // --------------------------------------------------
  // Dacă nu există progres
  // --------------------------------------------------
  if (!progress) {
    return (
      <p className="text-center mt-10 text-gray-300">
        No progress found for this course.
      </p>
    );
  }

  // --------------------------------------------------
  // UI principal
  // --------------------------------------------------

  return (
    <div className="border rounded p-5 bg-gray-900 shadow text-white">
      <h2 className="text-xl font-semibold mb-2">Course Progress</h2>

      <p className="text-gray-300">
        Lessons visited: {progress.visitedLessons} / {progress.totalLessons}
      </p>

      <p className="text-gray-300">
        Progress: {progress.progressPercent}%
      </p>

      <p className="text-gray-400 text-sm mt-1">
        Completed at: {new Date(progress.completedAt).toLocaleDateString()}
      </p>

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Lessons</h3>
        <ul className="space-y-2">
          {progress.lessons.map((lesson) => (
            <li key={lesson.lessonId} className="border-b border-gray-700 pb-2">
              <p className="font-medium">{lesson.title}</p>
              <p className="text-sm text-gray-400">
                {lesson.visited
                  ? `Visited on ${new Date(lesson.visitedAt).toLocaleDateString()}`
                  : "Not visited yet"}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
