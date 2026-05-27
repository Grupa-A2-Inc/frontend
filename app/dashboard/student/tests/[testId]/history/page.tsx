"use client";

import { use, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchMyAttemptsThunk } from "@/store/slices/takeTestSlice";
import Link from "next/link";

type Props = {
  params: Promise<{ testId: string }>;
};

type AttemptSummary = {
  attemptId: string;
  testTitle?: string;
  scorePercent?: number;
  status?: string;
  completedAt?: string;
};

function asAttemptSummary(value: unknown): AttemptSummary | null {
  if (!value || typeof value !== "object") return null;

  const attempt = value as Partial<AttemptSummary>;
  return typeof attempt.attemptId === "string" ? { ...attempt, attemptId: attempt.attemptId } : null;
}

export default function TestHistoryPage({ params }: Props) {
  const { testId } = use(params);
  const dispatch = useDispatch<AppDispatch>();
  const { myAttempts, loading, error } = useSelector(
    (state: RootState) => state.takeTest
  );

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
        {myAttempts.map(asAttemptSummary).filter((attempt): attempt is AttemptSummary => attempt !== null).map((attempt) => (
          <div key={attempt.attemptId} className="border rounded p-5 bg-gray-900 shadow">
            <h2 className="text-xl font-semibold mb-2">{attempt.testTitle}</h2>

            <p className="text-gray-300">
              Score: {attempt.scorePercent}%
            </p>

            <p className="text-gray-400 text-sm mt-1">
              Status: {attempt.status}
            </p>

            <p className="text-gray-400 text-sm mt-1">
              Date: {attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString() : "-"}
            </p>

            <Link
              href={`/dashboard/student/tests/${testId}/results?attemptId=${attempt.attemptId}`}
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
