"use client";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useState, useEffect, useCallback, use } from "react";
import { useAppSelector } from "@/store/hooks";
import { ClassDetails, Student } from "@/lib/classes/types";
import { apiFetch } from "@/lib/classes/api";

import ClassStatsGrid from "@/components/class-management/ClassStatsGrid";
import StudentList from "@/components/class-management/StudentList";
import EditInfoPanel from "@/components/class-management/EditInfoPanel";
import AddStudentModal from "@/components/class-management/AddStudentModal";
import ConfirmRemoveModal from "@/components/class-management/ConfirmRemoveModal";
import Toast from "@/components/class-ui/Toast";
import Spinner from "@/components/class-ui/Spinner";

export default function ClassManagementPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = use(params); // Next.js 14/15 standard pt params
  const token = useAppSelector((s) => s.auth.accessToken) ?? "";

  const [cls, setCls] = useState<ClassDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Student | null>(null);
  const [removing, setRemoving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchClass = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<ClassDetails>(`/api/v1/classes/${classId}`, token);
      setCls(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [classId, token]);

  useEffect(() => { fetchClass(); }, [fetchClass]);

  const handleSaved = (updated: Partial<ClassDetails>) => {
    setCls((prev) => (prev ? { ...prev, ...updated } : prev));
    setEditing(false);
    setToast({ message: "Class info updated.", type: "success" });
  };

  const handleStudentAdded = (student: Student) => {
    setCls((prev) => prev ? { ...prev, students: [...prev.students, student], studentCount: prev.studentCount + 1 } : prev);
    setShowAddModal(false);
    setToast({ message: "Student added.", type: "success" });
  };

  const handleRemoveConfirm = async () => {
    if (!removeTarget || !cls) return;
    setRemoving(true);
    try {
      await apiFetch(`/api/v1/classes/${cls.id}/students/${removeTarget.id}`, token, { method: "DELETE" });
      setCls((prev) => prev ? { ...prev, students: prev.students.filter((s) => s.id !== removeTarget.id), studentCount: prev.studentCount - 1 } : prev);
      setToast({ message: "Student removed.", type: "success" });
      setRemoveTarget(null);
    } catch (e: any) {
      setToast({ message: e.message, type: "error" });
    } finally {
      setRemoving(false);
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Spinner size={30} /></div>;
  if (error || !cls) return <div className="p-10 text-red-500 text-center">Failed to load class.</div>;

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link 
          href="/dashboard/admin/classes" 
          className="flex items-center gap-1 text-sm font-medium text-brand-muted hover:text-brand-text transition-colors mb-4 w-fit"
>
          <ChevronLeft size={16} />
          Classes
          </Link>
            <h1 className="text-2xl font-black tracking-tight text-brand-text">{cls.name}</h1>
            <p className="text-sm text-brand-muted">{cls.subject} · {cls.grade} · {cls.year}</p>
          </div>
          <button onClick={() => setEditing(!editing)} className="rounded-xl border border-brand-border px-4 py-2 text-sm font-semibold text-brand-text hover:bg-brand-mid transition">
            Editează
          </button>
        </div>

        {editing && <EditInfoPanel cls={cls} token={token} onSaved={handleSaved} onCancel={() => setEditing(false)} />}
        
        <ClassStatsGrid cls={cls} />

        {cls.description && (
          <div className="rounded-2xl border border-brand-border bg-brand-card px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">DESCRIERE</p>
            <p className="text-sm text-brand-text">{cls.description}</p>
          </div>
        )}

        <StudentList students={cls.students} studentCount={cls.studentCount} onAddClick={() => setShowAddModal(true)} onRemoveClick={setRemoveTarget} />
      </div>

      {showAddModal && <AddStudentModal token={token} classId={cls.id} existingIds={cls.students.map((s) => s.id)} onAdded={handleStudentAdded} onClose={() => setShowAddModal(false)} />}
      {removeTarget && <ConfirmRemoveModal student={removeTarget} removing={removing} onConfirm={handleRemoveConfirm} onCancel={() => setRemoveTarget(null)} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}