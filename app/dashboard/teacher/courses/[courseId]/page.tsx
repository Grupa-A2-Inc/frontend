"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, GraduationCap } from "lucide-react";

import AssignmentControls from "@/components/course-management/AssignmentControls";
import ContentTree from "@/components/course-management/ContentTree";
import CourseHeader from "@/components/course-management/CourseHeader";
import StudentsByClass from "@/components/course-management/StudentsByClass";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  loadClassrooms,
  loadStudentsByClass,
  setActiveTab,
} from "@/store/slices/courseManagementSlice";

type Props = {
  params: Promise<{
    courseId: string;
  }>;
};

export default function CourseManagementPage({ params }: Props) {
  const { courseId } = use(params);

  const dispatch = useAppDispatch();
  const { activeTab } = useAppSelector((state) => state.courseManagement);

  useEffect(() => {
    dispatch(loadClassrooms());
    dispatch(loadStudentsByClass(courseId));
  }, [courseId, dispatch]);

  return (
    <main className="min-h-screen bg-brand-bg px-6 py-8 text-brand-text">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link
              href="/dashboard/teacher"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-brand-muted transition hover:text-brand-text"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to my courses
            </Link>

            <h1 className="text-3xl font-bold tracking-tight text-brand-text">
              Course management
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-brand-muted">
              Manage content, tests, and student access for the selected course.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/dashboard/teacher/courses/${courseId}/edit`}
              className="rounded-xl border border-brand-border bg-brand-card px-4 py-2 text-sm font-semibold text-brand-text shadow-sm transition hover:bg-brand-bg"
            >
              Edit course
            </Link>

            <Link
              href={`/dashboard/teacher/courses/${courseId}/tests`}
              className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary/90"
            >
              Manage tests
            </Link>
          </div>
        </div>

        <CourseHeader courseId={courseId} />

        <section className="rounded-2xl border border-brand-border bg-brand-card p-2 shadow-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => dispatch(setActiveTab("content"))}
              className={`flex items-center gap-3 rounded-xl p-4 text-left transition ${
                activeTab === "content"
                  ? "bg-brand-primary text-white"
                  : "text-brand-text hover:bg-brand-bg"
              }`}
            >
              <span
                className={`rounded-lg p-2 ${
                  activeTab === "content"
                    ? "bg-white/15"
                    : "bg-brand-primary/10"
                }`}
              >
                <BookOpen
                  className={`h-5 w-5 ${
                    activeTab === "content"
                      ? "text-white"
                      : "text-brand-primary"
                  }`}
                />
              </span>

              <span>
                <span className="block font-semibold">Content</span>
                <span
                  className={`text-sm ${
                    activeTab === "content"
                      ? "text-white/75"
                      : "text-brand-muted"
                  }`}
                >
                  Course structure and tests
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => dispatch(setActiveTab("students"))}
              className={`flex items-center gap-3 rounded-xl p-4 text-left transition ${
                activeTab === "students"
                  ? "bg-brand-primary text-white"
                  : "text-brand-text hover:bg-brand-bg"
              }`}
            >
              <span
                className={`rounded-lg p-2 ${
                  activeTab === "students"
                    ? "bg-white/15"
                    : "bg-brand-primary/10"
                }`}
              >
                <GraduationCap
                  className={`h-5 w-5 ${
                    activeTab === "students"
                      ? "text-white"
                      : "text-brand-primary"
                  }`}
                />
              </span>

              <span>
                <span className="block font-semibold">Students</span>
                <span
                  className={`text-sm ${
                    activeTab === "students"
                      ? "text-white/75"
                      : "text-brand-muted"
                  }`}
                >
                  Classes, students, results, and access
                </span>
              </span>
            </button>
          </div>
        </section>

        {activeTab === "content" ? (
          <ContentTree courseId={courseId} />
        ) : (
          <div className="grid gap-6">
            <AssignmentControls courseId={courseId} />
            <StudentsByClass />
          </div>
        )}
      </div>
    </main>
  );
}