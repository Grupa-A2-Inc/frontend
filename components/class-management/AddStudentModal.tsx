"use client";
import { useState, useEffect } from "react";
import { ClassMember } from "@/lib/classes/types";
import Avatar from "@/components/class-ui/Avatar";
import Spinner from "@/components/class-ui/Spinner";

const API_URL = "https://api.adaptiveelearning.online";

interface OrgUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleName?: string;
  role?: string;
}

type Props = {
  token: string;
  classId: string;
  existingUserIds: string[];
  roleFilter: "STUDENT" | "TEACHER";
  onAdded: (member: ClassMember) => void;
  onClose: () => void;
};

export default function AddStudentModal({ token, classId, existingUserIds, roleFilter, onAdded, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [allStudents, setAllStudents] = useState<OrgUser[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/users/organization`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to load users");
        const data = await res.json();
        const arr: OrgUser[] = Array.isArray(data) ? data : (data.content ?? data.users ?? data.items ?? []);
        setAllStudents(arr.filter((u) => (u.roleName ?? u.role) === roleFilter));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoadingStudents(false);
      }
    };
    load();
  }, [token]);

  const filtered = allStudents.filter((u) => {
    if (existingUserIds.includes(u.id)) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q)
    );
  });

  const handleAdd = async (user: OrgUser) => {
    setAdding(user.id);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/classrooms/${classId}/members`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ memberIds: [user.id] }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to add member");
      }
      onAdded({ userId: user.id, email: user.email, membershipType: roleFilter });
    } catch (e: any) {
      setError(e.message);
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
