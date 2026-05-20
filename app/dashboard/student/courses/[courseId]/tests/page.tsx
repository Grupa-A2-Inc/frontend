"use client";

import { use, useEffect } from "react";
import Link from "next/link";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTestsForCourseThunk } from "@/store/slices/takeTestSlice";

type Props = {
  params: Promise<{ courseId: string }>;
};

type CourseTestListItem = {
  id?: string;
  testId?: string;
  title?: string;
  status?: string;
  isPublished?: boolean;
  createdAt?: string;
};

function asCourseTestListItem(value: unknown): CourseTestListItem {
  return value && typeof value === "object" ? (value as CourseTestListItem) : {};
}

export default function CourseTestsPage({ params }: Props) {
  const { courseId } = use(params);
  const dispatch = useAppDispatch();
  const { testsForCourse, loading, error } = useAppSelector((state) => state.takeTest);

  useEffect(() => {
    dispatch(fetchTestsForCourseThunk(courseId));
  }, [dispatch, courseId]);

  if (loading && testsForCourse.length === 0) {
    return <p className="mt-10 text-center text-gray-300">Loading tests...</p>;
  }

  if (error) {
    return (
      <div className="mt-10 text-center text-red-600">
        <p>Error: {error}</p>
        <button
          type="button"
          onClick={() => dispatch(fetchTestsForCourseThunk(courseId))}
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  if (testsForCourse.length === 0) {
    return <p className="mt-10 text-center text-gray-300">No tests available for this course.</p>;
  }

  return (
    <div className="mx-auto mt-10 max-w-3xl text-white">
      <h1 className="mb-8 text-center text-3xl font-bold">Available Tests</h1>

      <div className="space-y-4">
        {testsForCourse.map((rawTest, index) => {
          const test = asCourseTestListItem(rawTest);
          const testId = test.testId ?? test.id ?? String(index);
          const published = test.isPublished || test.status === "PUBLISHED";

          return (
            <div key={testId} className="rounded border bg-gray-900 p-5 shadow">
              <h2 className="mb-2 text-xl font-semibold">{test.title ?? "Lesson test"}</h2>

              <p className="text-gray-300">
                Status:{" "}
                {published ? (
                  <span className="text-green-400">Published</span>
                ) : (
                  <span className="text-yellow-400">Draft</span>
                )}
              </p>

              {test.createdAt && (
                <p className="mt-1 text-sm text-gray-400">
                  Created: {new Date(test.createdAt).toLocaleDateString()}
                </p>
              )}

              {published && (
                <Link
                  href={`/dashboard/student/tests/${testId}/take`}
                  className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Start Test
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
