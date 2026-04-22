"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchClassrooms,
  fetchTeachers,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  clearCreateError,
  clearUpdateError,
  Classroom,
} from "@/store/slices/classesSlice";

export default function ClassesPage() {
  const dispatch = useAppDispatch();
  const { classrooms, teachers, loading, error, creating, createError, updating, updateError, deleting } =
    useAppSelector((state) => state.classes);
  const { accessToken } = useAppSelector((state) => state.auth);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);

  const [name, setName]               = useState("");
  const [grade, setGrade]             = useState("");
  const [description, setDescription] = useState("");
  const [studentCount, setStudentCount] = useState<string>("0");
  const [teacherId, setTeacherId]     = useState("");
  const [validationError, setValidationError] = useState("");

  const token = accessToken ?? (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null) ?? "";

  useEffect(() => {
    dispatch(fetchClassrooms());
    if (token) dispatch(fetchTeachers(token));
  }, [dispatch]);

  const filtered = classrooms.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.grade.toLowerCase().includes(search.toLowerCase())
  );

  function resetForm() {
    setName("");
    setGrade("");
    setDescription("");
    setStudentCount("0");
    setTeacherId("");
    setValidationError("");
    dispatch(clearCreateError());
    dispatch(clearUpdateError());
  }

  function openModal() {
    resetForm();
    setEditingClassroom(null);
    setShowModal(true);
  }

  function openEditModal(classroom: Classroom) {
    setName(classroom.name);
    setGrade(classroom.grade);
    setDescription(classroom.description);
    setStudentCount(String(classroom.studentCount));
    setTeacherId(classroom.teacherId ?? "");
    setValidationError("");
    dispatch(clearUpdateError());
    setEditingClassroom(classroom);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingClassroom(null);
    resetForm();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim())        { setValidationError("Name is required.");        return; }
    if (!grade.trim())       { setValidationError("Grade is required.");       return; }
    if (!description.trim()) { setValidationError("Description is required."); return; }

    setValidationError("");

    const selectedTeacher = teachers.find((t) => t.id === teacherId);
    const teacherName = selectedTeacher
      ? `${selectedTeacher.firstName} ${selectedTeacher.lastName}`
      : undefined;

    const result = await dispatch(
      createClassroom({ name, grade, description, studentCount: Math.max(0, parseInt(studentCount) || 0), teacherId: teacherId || undefined, teacherName })
    );

    if (createClassroom.fulfilled.match(result)) closeModal();
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingClassroom) return;
    if (!name.trim())        { setValidationError("Name is required.");        return; }
    if (!grade.trim())       { setValidationError("Grade is required.");       return; }
    if (!description.trim()) { setValidationError("Description is required."); return; }

    setValidationError("");

    const selectedTeacher = teachers.find((t) => t.id === teacherId);
    const teacherName = selectedTeacher
      ? `${selectedTeacher.firstName} ${selectedTeacher.lastName}`
      : undefined;

    const result = await dispatch(
      updateClassroom({ id: editingClassroom.id, name, grade, description, studentCount: Math.max(0, parseInt(studentCount) || 0), teacherId: teacherId || undefined, teacherName })
    );

    if (updateClassroom.fulfilled.match(result)) closeModal();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    dispatch(deleteClassroom(id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Classes</h1>
          <p className="text-brand-text/40 text-sm mt-1">
            {classrooms.length} classroom{classrooms.length !== 1 ? "s" : ""} total
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

      <div className="relative mb-6 max-w-sm">
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
          placeholder="Search by name or grade..."
          className="w-full bg-brand-card border border-brand-primary/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-primary/60 transition-colors"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <p className="text-brand-text/40 text-sm">Loading classes...</p>
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center justify-center py-20">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="material-symbols-rounded text-brand-text/15" style={{ fontSize: "3rem" }}>
            meeting_room
          </span>
          <p className="text-brand-text/40 text-sm">
            {search ? "No classes match your search." : "No classes yet. Create your first one."}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((classroom) => (
            <div
              key={classroom.id}
              className="bg-brand-card border border-brand-primary/15 rounded-2xl p-5 hover:border-brand-primary/40 transition-colors flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-brand-text font-semibold text-sm leading-snug flex-1">
                  {classroom.name}
                </h3>
                <span className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium bg-brand-primary/15 text-brand-primary">
                  {classroom.grade}
                </span>
              </div>

              <p className="text-brand-text/40 text-xs leading-relaxed line-clamp-2 flex-1">
                {classroom.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-rounded text-brand-primary" style={{ fontSize: "1rem" }}>
                      group
                    </span>
                    <span className="text-brand-text/50 text-xs">{classroom.studentCount} students</span>
                  </div>
                  {classroom.teacherName && (
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-rounded text-brand-primary" style={{ fontSize: "1rem" }}>
                        person
                      </span>
                      <span className="text-brand-text/50 text-xs">{classroom.teacherName}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(classroom)}
                    disabled={updating === classroom.id}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-brand-text/20 hover:text-brand-primary hover:bg-brand-primary/10 transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: "1rem" }}>edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(classroom.id, classroom.name)}
                    disabled={deleting === classroom.id}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-brand-text/20 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: "1rem" }}>
                      {deleting === classroom.id ? "hourglass_empty" : "delete"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-brand-card border border-brand-primary/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-brand-text font-semibold text-lg">
                {editingClassroom ? "Edit Class" : "Add Class"}
              </h2>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-brand-text/40 hover:text-brand-text hover:bg-brand-text/10 transition-colors"
              >
                <span className="material-symbols-rounded" style={{ fontSize: "1.2rem" }}>close</span>
              </button>
            </div>

            <form onSubmit={editingClassroom ? handleEdit : handleCreate} className="flex flex-col gap-4">

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-brand-text/60">
                  Class Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 10th Grade A"
                  className="bg-brand-mid border border-brand-primary/20 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-brand-text/60">
                  Grade <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="e.g. 10th, 11th, 12th"
                  className="bg-brand-mid border border-brand-primary/20 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-brand-text/60">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the classroom..."
                  rows={3}
                  className="bg-brand-mid border border-brand-primary/20 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-brand-text/60">Number of Students</label>
                <input
                  type="number"
                  min={0}
                  value={studentCount}
                  onChange={(e) => setStudentCount(e.target.value)}
                  className="bg-brand-mid border border-brand-primary/20 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors"
                />
              </div>

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

              {(validationError || createError || updateError) && (
                <p className="text-red-400 text-sm font-medium">{validationError || createError || updateError}</p>
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
                  disabled={editingClassroom ? updating === editingClassroom.id : creating}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-brand-primary hover:bg-brand-primary/90 text-brand-text disabled:opacity-50 transition-colors"
                >
                  {editingClassroom
                    ? (updating === editingClassroom.id ? "Saving..." : "Save Changes")
                    : (creating ? "Creating..." : "Create Class")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}