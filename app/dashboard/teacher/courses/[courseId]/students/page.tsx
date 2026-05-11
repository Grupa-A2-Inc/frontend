"use client";

import { use,useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";

import AssignStudentsModal from "@/components/course-management/AssignStudentsModal";
import {
  fetchOrganizationStudents,
  fetchStudentsProgress,
} from "@/lib/courses/api";
import { OrganizationUser, StudentProgress } from "@/lib/courses/types";

type Props = {
  params: Promise<{ courseId: string }>;
};

type StudentWithDetails = StudentProgress & {
  name: string;
  email?: string;
};

export default function CourseStudentsPage({ params }: Props) {
  const { courseId } = use(params);

  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [organizationStudents, setOrganizationStudents] = useState<
    OrganizationUser[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [progressData, usersData] = await Promise.all([
        fetchStudentsProgress(courseId),
        fetchOrganizationStudents(),
      ]);

      setStudents(progressData);
      setOrganizationStudents(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load students.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);
  
  useEffect(() => {
  loadStudents();
}, [loadStudents]);

  const enrolledStudentIds = students.map((student) => student.studentId);

  const studentsWithDetails: StudentWithDetails[] = students.map((student) => {
    const user = organizationStudents.find(
      (orgStudent) => orgStudent.id === student.studentId
    );

    const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();

    return {
      ...student,
      name: fullName || user?.email || `Student ${student.studentId}`,
      email: user?.email,
    };
  });

  return (
    <main className="min-h-screen bg-brand-bg px-6 py-8 text-brand-text">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/dashboard/teacher/courses/${courseId}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-brand-muted transition hover:text-brand-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to course
        </Link>

        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Course students</h1>
            <p className="mt-2 text-sm text-brand-muted">
              View enrolled students and manage course assignments.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-primary/90"
          >
            <UserPlus className="h-4 w-4" />
            Assign students
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-brand-border bg-brand-card text-brand-muted">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading students...
          </div>
        ) : studentsWithDetails.length === 0 ? (
          <div className="rounded-xl border border-dashed border-brand-border bg-brand-card p-10 text-center text-brand-muted">
            No students enrolled yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-brand-border bg-brand-card">
            {studentsWithDetails.map((student) => (
              <div
                key={student.studentId}
                className="flex items-center justify-between border-b border-brand-border px-5 py-4 last:border-b-0"
              >
                <div>
                  <p className="font-semibold text-brand-text">
                    {student.name}
                  </p>

                  <p className="text-sm text-brand-muted">
                    {student.email ?? `Enrolled: ${student.enrolledAt || "N/A"}`}
                  </p>
                </div>

                <p className="text-sm font-medium text-brand-muted">
                  Progress: {Math.round(student.progressPercent ?? 0)}%
                </p>
              </div>
            ))}
          </div>
        )}

        {modalOpen && (
          <AssignStudentsModal
            courseId={courseId}
            enrolledStudentIds={enrolledStudentIds}
            onChanged={loadStudents}
            onClose={() => setModalOpen(false)}
          />
        )}
      </div>
    </main>
  );
}