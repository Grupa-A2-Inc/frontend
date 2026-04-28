"use client";

import { Search, Users } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setSearchQuery,
  setSortDirection,
  setSortField,
} from "@/store/slices/courseManagementSlice";
import {
  ClassWithStudents,
  EnrolledStudent,
  SortDirection,
  SortField,
} from "@/lib/courses/types";

function getStudentName(student: EnrolledStudent) {
  const name = `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim();

  return name || student.email;
}

function formatPercent(value?: number) {
  if (typeof value !== "number") return "—";

  return `${Math.round(value)}%`;
}

function filterGroups(groups: ClassWithStudents[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) return groups;

  return groups
    .map((group) => ({
      ...group,
      students: group.students.filter((student) => {
        const name = getStudentName(student).toLowerCase();
        const email = student.email.toLowerCase();

        return name.includes(normalizedQuery) || email.includes(normalizedQuery);
      }),
    }))
    .filter((group) => group.students.length > 0);
}

function sortStudents(
  students: EnrolledStudent[],
  sortField: SortField,
  sortDirection: SortDirection,
) {
  const multiplier = sortDirection === "asc" ? 1 : -1;

  return [...students].sort((a, b) => {
    if (sortField === "name") {
      return getStudentName(a).localeCompare(getStudentName(b)) * multiplier;
    }

    const aValue = a[sortField] ?? 0;
    const bValue = b[sortField] ?? 0;

    return (aValue - bValue) * multiplier;
  });
}

export default function StudentsByClass() {
  const dispatch = useAppDispatch();

  const {
    classWithStudents,
    loadingStudents,
    studentsError,
    searchQuery,
    sortField,
    sortDirection,
  } = useAppSelector((state) => state.courseManagement);

  const visibleGroups = filterGroups(classWithStudents, searchQuery).map(
    (group) => ({
      ...group,
      students: sortStudents(group.students, sortField, sortDirection),
    }),
  );

  const totalStudents = visibleGroups.reduce(
    (total, group) => total + group.students.length,
    0,
  );

  if (loadingStudents) {
    return (
      <section className="rounded-2xl border border-brand-border bg-brand-card p-6 shadow-sm">
        <div className="h-6 w-56 animate-pulse rounded bg-brand-bg" />
        <div className="mt-5 space-y-3">
          <div className="h-20 animate-pulse rounded-xl bg-brand-bg" />
          <div className="h-20 animate-pulse rounded-xl bg-brand-bg" />
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-brand-border bg-brand-card p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3">
          <div className="rounded-xl bg-brand-primary/10 p-2 text-brand-primary">
            <Users className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-brand-text">
              Students by class
            </h2>
            <p className="mt-1 text-sm text-brand-muted">
              {totalStudents} students displayed in {visibleGroups.length} classes.
            </p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
            <input
              value={searchQuery}
              onChange={(event) => dispatch(setSearchQuery(event.target.value))}
              placeholder="Search student..."
              className="h-10 w-full rounded-xl border border-brand-border bg-brand-bg pl-9 pr-3 text-sm text-brand-text outline-none placeholder:text-brand-muted focus:border-brand-primary sm:w-56"
            />
          </div>

          <select
            value={sortField}
            onChange={(event) =>
              dispatch(setSortField(event.target.value as SortField))
            }
            className="h-10 rounded-xl border border-brand-border bg-brand-bg px-3 text-sm text-brand-text outline-none focus:border-brand-primary"
          >
            <option value="name">Name / email</option>
            <option value="progressPercent">Progress</option>
            <option value="averageScore">Average score</option>
            <option value="passedTests">Passed tests</option>
          </select>

          <select
            value={sortDirection}
            onChange={(event) =>
              dispatch(setSortDirection(event.target.value as SortDirection))
            }
            className="h-10 rounded-xl border border-brand-border bg-brand-bg px-3 text-sm text-brand-text outline-none focus:border-brand-primary"
          >
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        </div>
      </div>

      {studentsError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {studentsError}
        </div>
      )}

      {visibleGroups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand-border p-8 text-center">
          <p className="font-medium text-brand-text">
            No students available for display.
          </p>
          <p className="mt-1 text-sm text-brand-muted">
            Assign the course to a class or modify the search filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleGroups.map((group) => (
            <div
              key={group.classId}
              className="overflow-hidden rounded-xl border border-brand-border"
            >
              <div className="bg-brand-bg px-4 py-3">
                <h3 className="font-semibold text-brand-text">
                  {group.className}
                </h3>
                <p className="text-xs text-brand-muted">
                  {group.students.length} students
                </p>
              </div>

              <div className="divide-y divide-brand-border">
                {group.students.map((student) => (
                  <div
                    key={student.id}
                    className="grid gap-3 px-4 py-3 text-sm md:grid-cols-[1.5fr_1fr_1fr_1fr]"
                  >
                    <div>
                      <p className="font-medium text-brand-text">
                        {getStudentName(student)}
                      </p>
                      <p className="text-xs text-brand-muted">{student.email}</p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-brand-muted">
                        Progress
                      </p>
                      <p className="font-medium text-brand-text">
                        {formatPercent(student.progressPercent)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-brand-muted">
                        Average score
                      </p>
                      <p className="font-medium text-brand-text">
                        {formatPercent(student.averageScore)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-brand-muted">
                        Passed / Failed
                      </p>
                      <p className="font-medium text-brand-text">
                        {student.passedTests ?? 0} / {student.failedTests ?? 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}