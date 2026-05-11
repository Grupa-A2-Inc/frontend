"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchTestResultThunk, resetTestState } from "@/store/slices/takeTestSlice";

// --------------------------------------------------
// Pagina de rezultate pentru student după trimiterea testului
// --------------------------------------------------

export default function Page({ params }: { params: { testId: string } }) {
  const dispatch = useDispatch<AppDispatch>();
  const { result, loading, error } = useSelector((state: RootState) => state.takeTest);

  // --------------------------------------------------
  // La încărcarea paginii, cerem rezultatul testului
  // --------------------------------------------------
  useEffect(() => {
    dispatch(fetchTestResultThunk(params.testId));
  }, [dispatch, params.testId]);

  // --------------------------------------------------
  // Stare de încărcare
  // --------------------------------------------------
  if (loading && !result) {
    return <p className="text-center mt-10">Loading results...</p>;
  }

  // --------------------------------------------------
  // Stare de eroare
  // --------------------------------------------------
  if (error) {
    return (
      <div className="text-center mt-10 text-red-600">
        <p>Error: {error}</p>
        <button
          onClick={() => dispatch(fetchTestResultThunk(params.testId))}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  // --------------------------------------------------
  // Dacă nu există rezultat
  // --------------------------------------------------
  if (!result) {
    return <p className="text-center mt-10">No result found for this test.</p>;
  }

  // --------------------------------------------------
  // UI principal
  // --------------------------------------------------

  return (
    <div className="max-w-2xl mx-auto mt-10 text-center">
      <h2 className="text-2xl font-bold mb-4">Test Results</h2>

      {/* Secțiunea cu scorul */}
      <div className="border rounded p-6 shadow mb-6">
        <p className="text-lg mb-2">Score: {result.score}</p>
        <p className="text-lg mb-2">
          Correct Answers: {result.correctAnswers} / {result.totalQuestions}
        </p>
        <p className="text-lg mb-4">
          Percentage: {((result.correctAnswers / result.totalQuestions) * 100).toFixed(2)}%
        </p>
      </div>

      {/* Secțiunea cu revizuirea întrebărilor */}
      {result.questions && (
        <div className="text-left border rounded p-6 shadow">
          <h3 className="text-xl font-semibold mb-4">Question Review</h3>
          <ul className="space-y-4">
            {result.questions.map((q: any, index: number) => (
              <li key={q.id} className="border-b pb-4">
                <p className="font-medium mb-2">
                  {index + 1}. {q.prompt}
                </p>

                <p
                  className={`mb-1 ${
                    q.isCorrect ? "text-green-600" : "text-red-600"
                  }`}
                >
                  Your answer: {q.selectedOptionLabel}
                </p>

                {!q.isCorrect && (
                  <p className="text-gray-600">
                    Correct answer: {q.correctOptionLabel}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Buton pentru revenire */}
      <button
        onClick={() => dispatch(resetTestState())}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Back to course
      </button>
    </div>
  );
}
