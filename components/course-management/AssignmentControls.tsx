"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Plus } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  assignCourse,
  clearAssignState,
} from "@/store/slices/courseManagementSlice";

type Props = {
  courseId: string;
};

export default function AssignmentControls({ courseId }: Props) {
  const dispatch = useAppDispatch();

  const {
    classrooms,
    loadingClassrooms,
    classroomsError,
    assigning,
    assignError,
    assignSuccess,
  } = useAppSelector((state) => state.courseManagement);

  const [selectedClassroomId, setSelectedClassroomId] = useState("");

  function handleAssign() {
    if (!selectedClassroomId || assigning) return;

    dispatch(clearAssignState());

    dispatch(
      assignCourse({
        courseId,
        classroomId: selectedClassroomId,
      }),
    );
  }

  return (
    <section className="rounded-2xl border border-brand-border bg-brand-card p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-brand-text">
          Assignment controls
        </h2>

        <p className="mt-1 text-sm text-brand-muted">
          Assign the course to a classroom. In the backend, course access is
          linked through classroom assignment.
        </p>
      </div>

      {classroomsError && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          <span>{classroomsError}</span>
        </div>
      )}

      {assignError && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          <span>{assignError}</span>
        </div>
      )}

      {assignSuccess && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          <span>The course has been successfully assigned.</span>
        </div>
      )}

      <div className="flex flex-col gap-3 md:flex-row">
        <select
          value={selectedClassroomId}
          onChange={(event) => setSelectedClassroomId(event.target.value)}
          disabled={loadingClassrooms || assigning}
          className="w-full rounded-xl border border-brand-border bg-brand-bg p-2 text-sm text-brand-text outline-none disabled:cursor-not-allowed disabled:opacity-60 md:max-w-sm"
        >
          <option value="">
            {loadingClassrooms ? "Loading classrooms..." : "Select a classroom"}
          </option>

          {classrooms.map((classroom) => (
            <option key={classroom.id} value={classroom.id}>
              {classroom.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleAssign}
          disabled={!selectedClassroomId || loadingClassrooms || assigning}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {assigning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}

          Assign course
        </button>
      </div>
    </section>
  );
}