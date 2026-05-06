"use client";
import Link from "next/link";
import { ChevronLeft, GraduationCap } from "lucide-react";
import { useState, useEffect, use } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSingleClass, fetchClassStudents } from "@/store/slices/classesSlice";
import { ClassDetails, ClassMember } from "@/lib/classes/types";

import ClassStatsGrid from "@/components/class-management/ClassStatsGrid";
import StudentList from "@/components/class-management/StudentList";
import EditInfoPanel from "@/components/class-management/EditInfoPanel";
import AddStudentModal from "@/components/class-management/AddStudentModal";
import ConfirmRemoveModal from "@/components/class-management/ConfirmRemoveModal";
import Toast from "@/components/class-ui/Toast";
import Spinner from "@/components/class-ui/Spinner";

const API_URL = "https://api.adaptiveelearning.online";

export default function ClassManagementPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = use(params);
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.accessToken) ?? "";

  const { currentClass, currentClassMembers, currentClassLoading, currentClassError } = useAppSelector((s) => s.classes);
  const cls = currentClass as unknown as ClassDetails;

  const [editing, setEditing] = useState(false);
  const [addModalRole, setAddModalRole] = useState<"STUDENT" | "TEACHER" | null>(null);
  const [removeTarget, setRemoveTarget] = useState<ClassMember | null>(null);
  const [removing, setRemoving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (token && classId) {
      dispatch(fetchSingleClass({ token, classId }));
      dispatch(fetchClassStudents({ token, classId }));
    }
  }, [dispatch, token, classId]);

  const handleSaved = async () => {
    setEditing(false);
    setToast({ message: "Class info updated.", type: "success" });
    dispatch(fetchSingleClass({ token, classId }));
  };

  const handleMemberAdded = () => {
    setAddModalRole(null);
    setToast({ message: "Member added.", type: "success" });
    dispatch(fetchClassStudents({ token, classId }));
  };

  const handleRemoveConfirm = async () => {
    if (!removeTarget || !cls) return;
    setRemoving(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/classrooms/${cls.id}/members`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ memberIds: [removeTarget.userId] }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to remove member");
      }
      setToast({ message: "Member removed.", type: "success" });
      setRemoveTarget(null);
      dispatch(fetchClassStudents({ token, classId }));
    } catch (e: any) {
      setToast({ message: e.message, type: "error" });
    } finally {
      setRemoving(false);
    }
  };

  if (currentClassLoading) return <div className="p-10 flex justify-center"><Spinner size={30} /></div>;
  if (currentClassError || !cls) return <div className="p-10 text-red-500 text-center">Failed to load class.</div>;

  const teachers = currentClassMembers.filter((m) => m.membershipType === "TEACHER");

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
            {cls.description && (
              <p className="text-sm text-brand-muted mt-1">{cls.description}</p>
            )}
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="rounded-xl border border-brand-border px-4 py-2 text-sm font-semibold text-brand-text hover:bg-brand-mid transition"
          >
            Edit
          </button>
        </div>

        {editing && (
          <EditInfoPanel
            cls={cls}
            token={token}
            onSaved={handleSaved}
            onCancel={() => setEditing(false)}
          />
        )}

        <ClassStatsGrid cls={cls} members={currentClassMembers} />

        {/* TEACHERS */}
        <div className="rounded-2xl border border-brand-border bg-brand-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1">Teachers</p>
              <p className="text-sm text-brand-text">{teachers.length} assigned</p>
            </div>
            <button
              onClick={() => setAddModalRole("TEACHER")}
              className="bg-brand-primary hover:opacity-90 transition text-white rounded-xl px-4 py-2 text-sm font-bold"
            >
              Assign teacher
            </button>
          </div>

          {teachers.length === 0 ? (
            <div className="py-8 text-center text-sm text-brand-muted">No teacher assigned yet.</div>
          ) : (
            <ul className="divide-y divide-brand-border">
              {teachers.map((t) => (
                <li key={t.userId} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-brand-mid/40 transition group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-brand-primary/15 flex items-center justify-center shrink-0">
                      <GraduationCap size={15} className="text-brand-primary" />
                    </div>
                    <p className="text-sm font-semibold text-brand-text truncate">{t.email}</p>
                  </div>
                  <button
                    onClick={() => setRemoveTarget(t)}
                    className="opacity-100 md:opacity-0 md:group-hover:opacity-100 rounded-lg border border-red-400/30 bg-red-400/10 px-2.5 py-1.5 text-xs font-semibold text-red-400 transition"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <StudentList
          members={currentClassMembers}
          onAddClick={() => setAddModalRole("STUDENT")}
          onRemoveClick={setRemoveTarget}
        />
      </div>

      {addModalRole && (
        <AddStudentModal
          token={token}
          classId={cls.id}
          existingUserIds={currentClassMembers.map((m) => m.userId)}
          roleFilter={addModalRole}
          onAdded={handleMemberAdded}
          onClose={() => setAddModalRole(null)}
        />
      )}
      {removeTarget && (
        <ConfirmRemoveModal
          member={removeTarget}
          removing={removing}
          onConfirm={handleRemoveConfirm}
          onCancel={() => setRemoveTarget(null)}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
