"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchTestsForCourseThunk } from "@/store/slices/takeTestSlice";
import Link from "next/link";

export default function CourseTestsPage({ params }: any) {
  const { courseId } = params;
  const dispatch = useDispatch<AppDispatch>();

  const { testsForCourse, loading, error } = useSelector(
    (state: RootState) => state.takeTest
  );

  useEffect(() => {
    dispatch(fetchTestsForCourseThunk(courseId));
  }, [dispatch, courseId]);

  // Loading
  if (loading && testsForCourse.length === 0) {
    return <p className="text-center mt-10 text-gray-300">Loading tests...</p>;
  }

  // Error
  if (error) {
    return (
      <div className="text-center mt-10 text-red-600">
        <p>Error: {error}</p>
        <button
          onClick={() => dispatch(fetchTestsForCourseThunk(courseId))}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (!testsForCourse || testsForCourse.length === 0) {
    return (
      <p className="text-center mt-10 text-gray-300">
        No tests available for this course.
      </p>
    );
  }

  // UI principal
  return (
    <div className="max-w-3xl mx-auto mt-10 text-white">
      <h1 className="text-3xl font-bold text-center mb-8">Available Tests</h1>

      <div className="space-y-4">
        {testsForCourse.map((test: any) => (
          <div
            key={test.testId}
            className="border rounded p-5 bg-gray-900 shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{test.title}</h2>

            <p className="text-gray-300">
              Status:{" "}
              {test.isPublished ? (
                <span className="text-green-400">Published</span>
              ) : (
                <span className="text-yellow-400">Draft</span>
              )}
            </p>

            <p className="text-gray-400 text-sm mt-1">
              Created: {new Date(test.createdAt).toLocaleDateString()}
            </p>

            <Link
              href={`/dashboard/student/tests/${test.testId}/start`}
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Start Test
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
