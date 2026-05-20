"use client";

import { useState, useEffect } from "react";
import {
  User,
  UserRole,
  fetchUsers,
  createUser,
  toggleUserStatus,
  deleteUser,
  updateUser,
  uploadUsersCsv,
  importUsersCsvStarted,
  importUsersCsvSucceeded,
  importUsersCsvFailed,
} from "@/store/slices/usersSlice";
import { fetchClassrooms } from "@/store/slices/classesSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import UsersHeader from "./UsersHeader";
import UsersToolbar from "./UsersToolbar";
import UsersTable from "./UsersTable";
import UserFormModal from "./UserFormModal";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { API_BASE } from "@/lib/config";

type RoleFilter = "ALL" | "STUDENT" | "TEACHER";
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";
type SavePayload = {
  firstName: string;
  lastName: string;
  email: string;
  roleName?: UserRole;
  classIds?: string[];
};

function matchesStatusFilter(userStatus: User["status"], statusFilter: StatusFilter): boolean {
  if (statusFilter === "ALL") return true;
  if (statusFilter === "ACTIVE") return userStatus === "ACTIVE";
  return userStatus !== "ACTIVE";
}

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const { users, loading, error, createError, importing, importError, importResult } = useAppSelector((state) => state.users);
  const { accessToken, user: authUser } = useAppSelector((state) => state.auth);
  const token = accessToken ?? (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null) ?? "";

  const [search, setSearch]             = useState("");
  const [roleFilter, setRoleFilter]     = useState<RoleFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [showModal, setShowModal]       = useState(false);
  const [editingUser, setEditingUser]   = useState<User | null>(null);
  const [saveError, setSaveError]       = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    dispatch(fetchUsers(token));
    dispatch(fetchClassrooms(token));
  }, [token, dispatch]);

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole   = roleFilter   === "ALL" || u.role   === roleFilter;
    const matchesStatus = matchesStatusFilter(u.status, statusFilter);
    return matchesSearch && matchesRole && matchesStatus;
  });

  function openAddModal()         { setEditingUser(null); setSaveError(null); setShowModal(true);  }
  function openEditModal(u: User) { setEditingUser(u);    setSaveError(null); setShowModal(true);  }
  function closeModal()           { setShowModal(false);  setEditingUser(null); setSaveError(null);}

  async function assignUserToClasses(userId: string, classIds: string[]) {
    await Promise.all(classIds.map(async (classId) => {
      const response = await fetchWithAuth(`${API_BASE}${ENDPOINTS.classrooms.members(classId)}`, token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberIds: [userId] }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to assign user to selected classes");
      }
    }));
  }

  async function handleSave(data: SavePayload) {
    setSaveError(null);
    if (editingUser) {
      const result = await dispatch(updateUser({
        token,
        userId: editingUser.id,
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          organizationId: authUser?.organizationId,
        },
      }));
      if (updateUser.fulfilled.match(result)) closeModal();
    } else {
      const roleName = data.roleName ?? "STUDENT";
      const result = await dispatch(createUser({
        token,
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          roleName,
          organizationId: authUser?.organizationId,
        },
      }));
      if (createUser.fulfilled.match(result)) {
        const selectedClassIds = data.classIds ?? [];
        const createdUser = result.payload as User | undefined;
        if (roleName === "TEACHER" && selectedClassIds.length > 0) {
          if (!createdUser?.id) {
            setSaveError("User was created, but the response did not include an id for class assignment.");
            dispatch(fetchUsers(token));
            return;
          }

          try {
            await assignUserToClasses(createdUser.id, selectedClassIds);
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to assign teacher to selected classes";
            setSaveError(`Teacher was created, but class assignment failed: ${message}`);
            dispatch(fetchUsers(token));
            return;
          }
        }

        dispatch(fetchUsers(token));
        closeModal();
      }
    }
  }

  async function handleToggleStatus(userId: string) {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await dispatch(toggleUserStatus({ token, userId, status: newStatus }));
  }

  async function handleDelete(userId: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    await dispatch(deleteUser({ token, userId }));
  }

  async function handleImportCsv(file: File) {
    dispatch(importUsersCsvStarted());

    try {
      const result = await uploadUsersCsv(token, file);
      dispatch(importUsersCsvSucceeded(result));
      dispatch(fetchUsers(token));
    } catch (error) {
      dispatch(importUsersCsvFailed(error instanceof Error ? error.message : "Failed to import CSV"));
    }
  }

  if (loading) {
    return (
      <div className="w-full px-6 py-10 space-y-10">
        <div className="space-y-2">
          <div className="h-8 w-56 animate-pulse rounded bg-[rgb(var(--skeleton-bg-1))]" />
          <div className="h-4 w-80 animate-pulse rounded bg-[rgb(var(--skeleton-bg-2))]" />
        </div>
        <div className="h-[360px] animate-pulse rounded-2xl bg-[rgb(var(--skeleton-bg-1))]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-6 py-10 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-brand-text">User Management</h1>
        </div>
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={() => dispatch(fetchUsers(token))}
          className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <UsersHeader
        totalUsers={users.length}
        onAddUser={openAddModal}
        onImportCsv={handleImportCsv}
        importing={importing}
      />

      {importError && (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {importError}
        </p>
      )}

      {importResult && (
        <p className="mb-4 rounded-xl border border-brand-primary/20 bg-brand-primary/10 px-4 py-3 text-sm text-brand-text">
          Imported {importResult.succeeded ?? 0} of {importResult.total ?? 0} users
          {(importResult.failed ?? 0) > 0 ? `, ${importResult.failed} failed.` : "."}
        </p>
      )}

      <UsersToolbar
        users={users}
        search={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <UsersTable
        filtered={filtered}
        search={search}
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        onEdit={openEditModal}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
      />

      {showModal && (
        <UserFormModal
          user={editingUser}
          serverError={saveError || createError}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
