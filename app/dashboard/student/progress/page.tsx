"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchStudentProgressThunk } from "@/store/slices/takeTestSlice";
import Link from "next/link";

// --------------------------------------------------
// Pagina de progres a studentului (lista testelor date)
// --------------------------------------------------

export default function StudentProgress() {
  const dispatch = useDispatch<AppDispatch>();

  // Preluăm progresul studentului din Redux
  const { progress, loading, error } = useSelector(
    (state: RootState) => state.takeTest
  );

  // --------------------------------------------------
  // La încărcarea paginii, cerem progresul studentului
  // --------------------------------------------------
  useEffect(() => {
    dispatch(fetchStudentProgressThunk());
  }, [dispatch]);

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
          onClick={() => dispatch(fetchStudentProgressThunk())}
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
  if (!progress || progress.length === 0) {
    return (
      <p className="text-center mt-10 text-gray-300">
        You haven't completed any tests yet.
      </p>
    );
  }

  // --------------------------------------------------
  // UI principal
  // --------------------------------------------------

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-3xl font-bold text-center mb-8 text-white">
        My Progress
      </h1>

      <div className="space-y-4">
        {progress.map((test: any) => (
          <div
            key={test.testId}
            className="border rounded p-5 bg-gray-900 shadow text-white"
          >
            <h2 className="text-xl font-semibold mb-2">{test.title}</h2>

            <p className="text-gray-300">
              Score: <span className="font-medium">{test.score}</span>
            </p>

            <p className="text-gray-300">
              Correct: {test.correctAnswers} / {test.totalQuestions}
            </p>

            <p className="text-gray-400 text-sm mt-1">
              Taken on: {new Date(test.date).toLocaleDateString()}
            </p>

            <Link
              href={`/dashboard/student/tests/${test.testId}/results`}
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View Results
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
