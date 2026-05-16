"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Search, Users, X } from "lucide-react";

import {
  assignCourseToClassroom,
  fetchClassrooms,
} from "@/lib/courses/api";
import { Classroom } from "@/lib/courses/types";

type Props = {
  courseId: string;
  onChanged: () => void;
  onClose: () => void;
};

export default function AssignStudentsModal({
  courseId,
  onChanged,
  onClose,
}: Props) {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [assignedId, setAssignedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchClassrooms();
        if (active) setClassrooms(data);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load classrooms.");
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
    if (!q) return classrooms;

    return classrooms.filter((classroom) => {
      const description = classroom.description?.toLowerCase() ?? "";
      return (
        classroom.name.toLowerCase().includes(q) ||
        description.includes(q)
      );
    });
  }, [query, classrooms]);

  async function handleAssign(classroom: Classroom) {
    setWorkingId(classroom.id);
    setAssignedId(null);
    setError(null);

    try {
      await assignCourseToClassroom(classroom.id, courseId);
      setAssignedId(classroom.id);
      onChanged();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Classroom assignment failed.",
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
              Assign this course to one of your classrooms.
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
              placeholder="Search classrooms..."
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
              Loading classrooms...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-brand-border p-8 text-center text-sm text-brand-muted">
              No classrooms found.
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((classroom) => {
                const isWorking = workingId === classroom.id;
                const wasAssigned = assignedId === classroom.id;

                return (
                  <div
                    key={classroom.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-brand-border bg-brand-bg px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-brand-text">
                        {classroom.name}
                      </p>
                      <p className="truncate text-xs text-brand-muted">
                        {classroom.description || "Classroom"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAssign(classroom)}
                      disabled={wasAssigned || isWorking || !!workingId}
                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        wasAssigned
                          ? "border border-green-400/30 bg-green-400/10 text-green-300"
                          : "bg-brand-primary text-white hover:bg-brand-primary/90"
                      }`}
                    >
                      {isWorking ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : wasAssigned ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Users className="h-4 w-4" />
                      )}
                      {wasAssigned ? "Assigned" : "Assign course"}
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
