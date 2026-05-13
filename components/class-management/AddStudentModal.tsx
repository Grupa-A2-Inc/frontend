"use client";
import { useMemo, useState } from "react";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useAddClassroomMembersMutation } from "@/store/api/classroomsApi";
import { useGetOrganizationUsersQuery } from "@/store/api/usersApi";
import type { ClassroomMember as ClassMember } from "@/types/domain/classrooms";
import type { User } from "@/types/domain/users";
import Avatar from "@/components/class-ui/Avatar";
import Spinner from "@/components/class-ui/Spinner";

type Props = {
  classId: string;
  existingUserIds: string[];
  roleFilter: "STUDENT" | "TEACHER";
  onAdded: (member: ClassMember) => void;
  onClose: () => void;
};

export default function AddStudentModal({ classId, existingUserIds, roleFilter, onAdded, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { data: users = [], isLoading: loadingStudents, error: usersError } = useGetOrganizationUsersQuery();
  const [addClassroomMembers] = useAddClassroomMembersMutation();

  const filtered = useMemo(() => users.filter((u) => {
    if (u.role !== roleFilter) return false;
    if (existingUserIds.includes(u.id)) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q)
    );
  }), [existingUserIds, query, roleFilter, users]);

  const handleAdd = async (user: User) => {
    setAdding(user.id);
    setError(null);
    try {
      await addClassroomMembers({
        classroomId: classId,
        data: { memberIds: [user.id] },
      }).unwrap();
      onAdded({ userId: user.id, email: user.email, membershipType: roleFilter });
    } catch (e: unknown) {
      setError(getApiErrorMessage(e));
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-black/40 backdrop-blur-sm"><div className="min-h-full flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-brand-border bg-brand-card shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-brand-border px-6 py-4">
          <h3 className="text-base font-bold text-brand-text">{roleFilter === "TEACHER" ? "Assign teacher" : "Add student"}</h3>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-text">✕</button>
        </div>

        <div className="px-6 py-4">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full rounded-xl border border-brand-border bg-brand-mid px-4 py-2.5 text-sm text-brand-text focus:outline-none"
          />
        </div>

        <div className="max-h-[300px] overflow-y-auto px-6 pb-6 space-y-2">
          {loadingStudents && <div className="flex justify-center py-4"><Spinner /></div>}
          {usersError && <p className="text-red-400 text-sm text-center">{getApiErrorMessage(usersError)}</p>}
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          {!loadingStudents && filtered.length === 0 && (
            <p className="text-center text-sm text-brand-muted py-4">No {roleFilter === "TEACHER" ? "teachers" : "students"} available to add.</p>
          )}
          {!loadingStudents && filtered.map((user) => (
            <div key={user.id} className="flex items-center justify-between rounded-xl border border-brand-border bg-brand-mid/40 px-4 py-3">
              <div className="flex items-center gap-3">
                <Avatar name={`${user.firstName} ${user.lastName}`.trim() || user.email} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-brand-text">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-brand-muted">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => handleAdd(user)}
                disabled={!!adding}
                className="bg-brand-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50"
              >
                {adding === user.id ? "..." : "Add"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div></div>
  );
}
