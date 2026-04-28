"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCourses,
  fetchTeachers,
  createCourse,
  deleteCourse,
  clearCreateError,
  CourseStatus,
} from "@/store/slices/coursesSlice";

type StatusFilter = "ALL" | "DRAFT" | "PUBLISHED";

export default function CoursesPage() {
  const dispatch = useAppDispatch();
  const { courses, teachers, loading, error, creating, createError, deleting } =
    useAppSelector((state) => state.courses);
  const { accessToken } = useAppSelector((state) => state.auth);

  // Filters
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  // Modal
  const [showModal, setShowModal] = useState(false);

  // Form fields
  const [title, setTitle]               = useState("");
  const [description, setDescription]   = useState("");
  const [category, setCategory]         = useState("");
  const [status, setStatus]             = useState<CourseStatus>("DRAFT");
  const [teacherId, setTeacherId]       = useState("");
  const [validationError, setValidationError] = useState("");

  const token = accessToken ?? (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null) ?? "";

  useEffect(() => {
    if (!token) return;
    dispatch(fetchCourses(token));
    dispatch(fetchTeachers(token));
  }, [accessToken, dispatch]);

  // -------------------- Derived counts --------------------
  const draftCount     = courses.filter((c) => c.status === "DRAFT").length;
  const publishedCount = courses.filter((c) => c.status === "PUBLISHED").length;

  // -------------------- Filter logic --------------------
  const filtered = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // -------------------- Form helpers --------------------
  function resetForm() {
    setTitle("");
    setDescription("");
    setCategory("");
    setStatus("DRAFT");
    setTeacherId("");
    setValidationError("");
    dispatch(clearCreateError());
  }

  function openModal() {
    resetForm();
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    resetForm();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim())       { setValidationError("Title is required.");       return; }
    if (!description.trim()) { setValidationError("Description is required."); return; }
    if (!category.trim())    { setValidationError("Category is required.");    return; }

    const duplicate = courses.some(
      (c) => c.title.trim().toLowerCase() === title.trim().toLowerCase()
    );
    if (duplicate) { setValidationError("A class with this title already exists."); return; }

    setValidationError("");

    const result = await dispatch(
      createCourse({
        token,
        data: { title, description, category, status, teacherId: teacherId || undefined },
      })
    );

    if (createCourse.fulfilled.match(result)) {
      closeModal();
      dispatch(fetchCourses(token));
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    dispatch(deleteCourse({ token, id }));
    // Optimistic: Redux removes it from state immediately on fulfilled
  }

  // -------------------- Tab config --------------------
  const tabs: { label: string; value: StatusFilter; count: number }[] = [
    { label: "All",       value: "ALL",       count: courses.length },
    { label: "Draft",     value: "DRAFT",     count: draftCount },
    { label: "Published", value: "PUBLISHED", count: publishedCount },
  ];

  return (
    <div>
      {/* -------------------- HEADER -------------------- */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Classes</h1>
          <p className="text-brand-text/40 text-sm mt-1">
            {courses.length} class{courses.length !== 1 ? "es" : ""} total
          </p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-brand-text rounded-xl text-sm font-medium transition-colors"
        >
          <span className="material-symbols-rounded" style={{ fontSize: "1.1rem" }}>add</span>
          Add Class
        </button>
      </div>

      {/* -------------------- SEARCH + TABS -------------------- */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
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

        {/* Status tabs */}
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

      {/* -------------------- LOADING -------------------- */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <p className="text-brand-text/40 text-sm">Loading classes...</p>
        </div>
      )}

      {/* -------------------- ERROR -------------------- */}
      {error && !loading && (
        <div className="flex items-center justify-center py-20">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* -------------------- EMPTY -------------------- */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="material-symbols-rounded text-brand-text/15" style={{ fontSize: "3rem" }}>
            school
          </span>
          <p className="text-brand-text/40 text-sm">
            {search || statusFilter !== "ALL"
              ? "No classes match your filters."
              : "No classes yet. Create your first one."}
          </p>
        </div>
      )}

      {/* -------------------- GRID -------------------- */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((course) => (
            <div
              key={course.id}
              className="bg-brand-card border border-brand-primary/15 rounded-2xl p-5 hover:border-brand-primary/40 transition-colors flex flex-col gap-3"
            >
              {/* Title + status badge */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-brand-text font-semibold text-sm leading-snug flex-1">
                  {course.title}
                </h3>
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

              {/* Footer: meta + delete */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-rounded text-brand-primary" style={{ fontSize: "1rem" }}>
                      category
                    </span>
                    <span className="text-brand-text/50 text-xs">{course.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-rounded text-brand-primary" style={{ fontSize: "1rem" }}>
                      {course.visibility === "PUBLIC" ? "public" : "lock"}
                    </span>
                    <span className="text-brand-text/50 text-xs capitalize">
                      {course.visibility?.toLowerCase() ?? "private"}
                    </span>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(course.id, course.title)}
                  disabled={deleting === course.id}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-brand-text/20 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-rounded" style={{ fontSize: "1rem" }}>
                    {deleting === course.id ? "hourglass_empty" : "delete"}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* -------------------- ADD CLASS MODAL -------------------- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-brand-card border border-brand-primary/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-brand-text font-semibold text-lg">Add Class</h2>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-brand-text/40 hover:text-brand-text hover:bg-brand-text/10 transition-colors"
              >
                <span className="material-symbols-rounded" style={{ fontSize: "1.2rem" }}>close</span>
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-brand-text/60">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mathematics Grade 10"
                  className="bg-brand-mid border border-brand-primary/20 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-brand-text/60">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the class..."
                  rows={3}
                  className="bg-brand-mid border border-brand-primary/20 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors resize-none"
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-brand-text/60">
                  Category <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Science, Math, Literature"
                  className="bg-brand-mid border border-brand-primary/20 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors"
                />
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-brand-text/60">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CourseStatus)}
                  className="bg-brand-mid border border-brand-primary/20 rounded-xl px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-primary/60 transition-colors"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>

              {/* Teacher */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-brand-text/60">
                  Assign Teacher <span className="text-brand-text/30 font-normal">(optional)</span>
                </label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="bg-brand-mid border border-brand-primary/20 rounded-xl px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-primary/60 transition-colors"
                >
                  <option value="">No teacher assigned</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {(validationError || createError) && (
                <p className="text-red-400 text-sm font-medium">{validationError || createError}</p>
              )}

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-brand-text/60 hover:text-brand-text border border-brand-primary/20 hover:bg-brand-text/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-brand-primary hover:bg-brand-primary/90 text-brand-text disabled:opacity-50 transition-colors"
                >
                  {creating ? "Creating..." : "Create Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
