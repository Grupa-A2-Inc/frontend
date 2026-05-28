"use client";
import { useState, useEffect } from "react";
import { ClassMember } from "@/lib/classes/types";
import Avatar from "@/components/class-ui/Avatar";
import Spinner from "@/components/class-ui/Spinner";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { API_BASE } from "@/lib/config";

const API_URL = API_BASE;

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

type OrganizationUsersResponse =
  | OrgUser[]
  | {
      content?: OrgUser[];
      users?: OrgUser[];
      items?: OrgUser[];
      totalPages?: number;
      number?: number;
      page?: number;
      size?: number;
      last?: boolean;
    };

const USERS_PAGE_SIZE = 100;
const MAX_USERS_PAGES = 1000;

function getUsersFromResponse(data: OrganizationUsersResponse): OrgUser[] {
  if (Array.isArray(data)) return data;
  return data.content ?? data.users ?? data.items ?? [];
}

function shouldFetchNextPage(
  data: OrganizationUsersResponse,
  page: number,
  itemCount: number
): boolean {
  if (Array.isArray(data)) return false;
  if (typeof data.last === "boolean") return !data.last;
  if (typeof data.totalPages === "number") return page + 1 < data.totalPages;
  return itemCount === USERS_PAGE_SIZE;
}

async function fetchOrganizationUsersPage(
  token: string,
  roleFilter: Props["roleFilter"],
  page: number
): Promise<OrganizationUsersResponse> {
  const query = new URLSearchParams({
    page: String(page),
    size: String(USERS_PAGE_SIZE),
    sortBy: "firstName",
    sortDir: "asc",
    role: roleFilter,
  });

  const res = await fetchWithAuth(
    `${API_URL}/api/v1/users/organization?${query.toString()}`,
    token,
    { headers: { "Content-Type": "application/json" } }
  );

  if (!res.ok) throw new Error("Failed to load users");
  return (await res.json()) as OrganizationUsersResponse;
}

async function fetchAllOrganizationUsers(
  token: string,
  roleFilter: Props["roleFilter"]
): Promise<OrgUser[]> {
  const allUsers = new Map<string, OrgUser>();

  for (let page = 0; page < MAX_USERS_PAGES; page += 1) {
    const data = await fetchOrganizationUsersPage(token, roleFilter, page);
    const users = getUsersFromResponse(data);
    const previousSize = allUsers.size;
    users.forEach((user) => allUsers.set(user.id, user));

    if (!shouldFetchNextPage(data, page, users.length)) break;
    if (page > 0 && allUsers.size === previousSize) break;
  }

  return [...allUsers.values()];
}

export default function AddStudentModal({ token, classId, existingUserIds, roleFilter, onAdded, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [allStudents, setAllStudents] = useState<OrgUser[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoadingStudents(true);
      setError(null);

      try {
        const arr = await fetchAllOrganizationUsers(token, roleFilter);
        if (active) {
          setAllStudents(arr.filter((u) => (u.roleName ?? u.role) === roleFilter));
        }
      } catch (e) {
        if (active) {
          setError(e instanceof Error ? e.message : "Failed to load users");
        }
      } finally {
        if (active) setLoadingStudents(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [token, roleFilter]);

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
      const res = await fetchWithAuth(`${API_URL}/api/v1/classrooms/${classId}/members`, token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberIds: [user.id] }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to add member");
      }
      onAdded({ userId: user.id, email: user.email, membershipType: roleFilter });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add member");
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
