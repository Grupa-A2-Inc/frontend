"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchMyAttemptsThunk } from "@/store/slices/takeTestSlice";
import Link from "next/link";

export default function TestHistoryPage({ params }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { myAttempts, loading, error } = useSelector(
    (state: RootState) => state.takeTest
  );

  // Pentru demo, poți seta un testId fix până ai routing complet
  const testId = params?.testId || "demo-test-id";

  useEffect(() => {
    dispatch(fetchMyAttemptsThunk(testId));
  }, [dispatch, testId]);

  if (loading && myAttempts.length === 0) {
    return <p className="text-center mt-10 text-gray-300">Loading attempts...</p>;
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-red-600">
        <p>Error: {error}</p>
        <button
          onClick={() => dispatch(fetchMyAttemptsThunk(testId))}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!myAttempts || myAttempts.length === 0) {
    return (
      <p className="text-center mt-10 text-gray-300">
        No attempts found for this test.
      </p>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 text-white">
      <h1 className="text-3xl font-bold text-center mb-8">My Test Attempts</h1>

      <div className="space-y-4">
        {myAttempts.map((attempt: any) => (
          <div key={attempt.attemptId} className="border rounded p-5 bg-gray-900 shadow">
            <h2 className="text-xl font-semibold mb-2">{attempt.testTitle}</h2>

            <p className="text-gray-300">
              Score: {attempt.scorePercent}%
            </p>

            <p className="text-gray-400 text-sm mt-1">
              Status: {attempt.status}
            </p>

            <p className="text-gray-400 text-sm mt-1">
              Date: {new Date(attempt.completedAt).toLocaleDateString()}
            </p>

            <Link
              href={`/dashboard/student/attempts/${attempt.attemptId}/result`}
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View Result
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
