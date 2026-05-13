"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, UserMinus, UserPlus, X } from "lucide-react";

import {
  apiEnrollStudent,
  apiUnenrollStudent,
  fetchOrganizationStudents,
} from "@/lib/courses/api";
import { OrganizationUser } from "@/lib/courses/types";

type Props = {
  courseId: string;
  enrolledStudentIds: string[];
  onChanged: () => void;
  onClose: () => void;
};

function getName(user: OrganizationUser) {
  const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return name || user.email;
}

export default function AssignStudentsModal({
  courseId,
  enrolledStudentIds,
  onChanged,
  onClose,
}: Props) {
  const [students, setStudents] = useState<OrganizationUser[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [localEnrolledIds, setLocalEnrolledIds] = useState(
    () => new Set(enrolledStudentIds),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocalEnrolledIds(new Set(enrolledStudentIds));
  }, [enrolledStudentIds]);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchOrganizationStudents();
        if (active) setStudents(data);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load students.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;

    return students.filter((student) => {
      const name = getName(student).toLowerCase();
      return name.includes(q) || student.email.toLowerCase().includes(q);
    });
  }, [query, students]);

  async function handleToggle(student: OrganizationUser) {
    const isEnrolled = localEnrolledIds.has(student.id);
    setWorkingId(student.id);
    setError(null);

    try {
      if (isEnrolled) {
        await apiUnenrollStudent(courseId, student.id);
        setLocalEnrolledIds((prev) => {
          const next = new Set(prev);
          next.delete(student.id);
          return next;
        });
      } else {
        await apiEnrollStudent(courseId, student.id);
        setLocalEnrolledIds((prev) => new Set(prev).add(student.id));
      }

      onChanged();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Student assignment failed. Check that the backend supports teacher-managed enrollment.",
      );
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-brand-border bg-brand-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-brand-border px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-brand-text">Assign students</h3>
            <p className="mt-1 text-sm text-brand-muted">
              Enroll or remove individual students for this course.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-brand-muted transition hover:bg-brand-bg hover:text-brand-text"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-brand-border px-6 py-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search students..."
              className="h-11 w-full rounded-xl border border-brand-border bg-brand-bg pl-9 pr-3 text-sm text-brand-text outline-none placeholder:text-brand-muted focus:border-brand-primary"
            />
          </div>
        </div>

        <div className="max-h-[430px] overflow-y-auto px-6 py-4">
          {error && (
            <div className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12 text-brand-muted">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading students...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-brand-border p-8 text-center text-sm text-brand-muted">
              No students found.
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((student) => {
                const isEnrolled = localEnrolledIds.has(student.id);
                const isWorking = workingId === student.id;

                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-brand-border bg-brand-bg px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-brand-text">
                        {getName(student)}
                      </p>
                      <p className="truncate text-xs text-brand-muted">{student.email}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggle(student)}
                      disabled={isWorking || !!workingId}
                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        isEnrolled
                          ? "border border-red-400/30 bg-red-400/10 text-red-300 hover:bg-red-400/20"
                          : "bg-brand-primary text-white hover:bg-brand-primary/90"
                      }`}
                    >
                      {isWorking ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isEnrolled ? (
                        <UserMinus className="h-4 w-4" />
                      ) : (
                        <UserPlus className="h-4 w-4" />
                      )}
                      {isEnrolled ? "Unenroll" : "Enroll"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
