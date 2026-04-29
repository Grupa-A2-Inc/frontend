"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCourses, deleteCourse } from "@/store/slices/coursesSlice";

type StatusFilter = "ALL" | "DRAFT" | "PUBLISHED";

export default function TeacherCoursesPage() {
  const dispatch = useAppDispatch();
  const { courses, loading, error, deleting } = useAppSelector((state) => state.courses);
  const { accessToken } = useAppSelector((state) => state.auth);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const token =
    accessToken ??
    (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null) ??
    "";

  useEffect(() => {
    if (!token) return;
    dispatch(fetchCourses(token));
  }, [token, dispatch]);

  async function handleDeleteDraft(e: React.MouseEvent, id: string, title: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete draft "${title}"? This cannot be undone.`)) return;
    dispatch(deleteCourse({ token, id }));
  }

  const draftCount     = courses.filter((c) => c.status === "DRAFT").length;
  const publishedCount = courses.filter((c) => c.status === "PUBLISHED").length;

  const filtered = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const tabs: { label: string; value: StatusFilter; count: number }[] = [
    { label: "All",       value: "ALL",       count: courses.length },
    { label: "Draft",     value: "DRAFT",     count: draftCount },
    { label: "Published", value: "PUBLISHED", count: publishedCount },
  ];

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">My Courses</h1>
          <p className="text-brand-text/40 text-sm mt-1">
            {courses.length} course{courses.length !== 1 ? "s" : ""} assigned to you
          </p>
        </div>
        <Link
          href="/dashboard/teacher/courses/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <span className="material-symbols-rounded" style={{ fontSize: "1.1rem" }}>add</span>
          New Course
        </Link>
      </div>

      {/* SEARCH + TABS */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <span
            className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/30"
            style={{ fontSize: "1.2rem" }}
          >
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or category..."
            className="w-full bg-brand-card border border-brand-primary/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-primary/60 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 bg-brand-card border border-brand-primary/20 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === tab.value
                  ? "bg-brand-primary text-brand-text"
                  : "text-brand-text/50 hover:text-brand-text"
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  statusFilter === tab.value
                    ? "bg-brand-text/20 text-brand-text"
                    : "bg-brand-text/10 text-brand-muted"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <p className="text-brand-text/40 text-sm">Loading courses...</p>
        </div>
      )}

      {/* ERROR */}
      {error && !loading && (
        <div className="flex items-center justify-center py-20">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* EMPTY */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span
            className="material-symbols-rounded text-brand-text/15"
            style={{ fontSize: "3rem" }}
          >
            menu_book
          </span>
          <p className="text-brand-text/40 text-sm">
            {search || statusFilter !== "ALL"
              ? "No courses match your filters."
              : "No courses assigned to you yet."}
          </p>
        </div>
      )}

      {/* GRID */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((course) => (
            <div
              key={course.id}
              className="bg-brand-card border border-brand-primary/15 rounded-2xl p-5 hover:border-brand-primary/40 transition-colors flex flex-col gap-3"
            >
              {/* Title + status badge */}
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={`/dashboard/teacher/courses/${course.id}`}
                  className="text-brand-text font-semibold text-sm leading-snug flex-1 hover:text-brand-primary transition-colors"
                >
                  {course.title}
                </Link>
                <span
                  className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${
                    course.status === "PUBLISHED"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-yellow-500/15 text-yellow-400"
                  }`}
                >
                  {course.status === "PUBLISHED" ? "Published" : "Draft"}
                </span>
              </div>

              {/* Description */}
              <p className="text-brand-text/40 text-xs leading-relaxed line-clamp-2 flex-1">
                {course.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="material-symbols-rounded text-brand-primary"
                      style={{ fontSize: "1rem" }}
                    >
                      category
                    </span>
                    <span className="text-brand-text/50 text-xs">{course.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="material-symbols-rounded text-brand-primary"
                      style={{ fontSize: "1rem" }}
                    >
                      {course.visibility === "PUBLIC" ? "public" : "lock"}
                    </span>
                    <span className="text-brand-text/50 text-xs capitalize">
                      {course.visibility?.toLowerCase() ?? "private"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {course.status === "DRAFT" && (
                    <button
                      onClick={(e) => handleDeleteDraft(e, course.id, course.title)}
                      disabled={deleting === course.id}
                      title="Delete draft"
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-brand-text/20 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-rounded" style={{ fontSize: "1rem" }}>
                        {deleting === course.id ? "hourglass_empty" : "delete"}
                      </span>
                    </button>
                  )}
                  <Link
                    href={`/dashboard/teacher/courses/${course.id}`}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-brand-primary/40 hover:text-brand-primary hover:bg-brand-primary/10 transition-colors"
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: "1.1rem" }}>arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
