"use client";

import { useMemo, useState } from "react";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useAppSelector } from "@/store/hooks";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetOrganizationUsersQuery,
  useUpdateUserMutation,
  useUpdateUserStatusMutation,
} from "@/store/api/usersApi";
import type { User, UserRole } from "@/types/domain/users";
import UsersHeader from "./UsersHeader";
import UsersToolbar from "./UsersToolbar";
import UsersTable from "./UsersTable";
import UserFormModal from "./UserFormModal";

type RoleFilter = "ALL" | "STUDENT" | "TEACHER";
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

export default function UsersPage() {
  const authUser = useAppSelector((state) => state.auth.user);
  const {
    data: serverUsers = [],
    isLoading,
    error,
    refetch,
  } = useGetOrganizationUsersQuery();
  const [createUser, { error: createError }] = useCreateUserMutation();
  const [updateUser, { error: updateError }] = useUpdateUserMutation();
  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [search, setSearch]             = useState("");
  const [roleFilter, setRoleFilter]     = useState<RoleFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [showModal, setShowModal]       = useState(false);
  const [editingUser, setEditingUser]   = useState<User | null>(null);
  const [importedUsers, setImportedUsers] = useState<User[]>([]);

  const users = useMemo(
    () => [...serverUsers, ...importedUsers],
    [serverUsers, importedUsers]
  );
  const modalError =
    createError || updateError
      ? getApiErrorMessage(createError ?? updateError)
      : null;

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole   = roleFilter   === "ALL" || u.role   === roleFilter;
    const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  function openAddModal()         { setEditingUser(null); setShowModal(true);  }
  function openEditModal(u: User) { setEditingUser(u);    setShowModal(true);  }
  function closeModal()           { setShowModal(false);  setEditingUser(null);}

  async function handleSave(data: { firstName: string; lastName: string; email: string; roleName?: string }) {
    if (editingUser) {
      await updateUser({
        userId: editingUser.id,
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          organizationId: authUser?.organizationId,
        },
      }).unwrap();
      closeModal();
    } else {
      await createUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        roleName: (data.roleName ?? "STUDENT") as UserRole,
        organizationId: authUser?.organizationId,
      }).unwrap();
      closeModal();
    }
  }

  async function handleToggleStatus(userId: string) {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await updateUserStatus({ userId, data: { status: newStatus } });
  }

  async function handleDelete(userId: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    await deleteUser(userId);
    setImportedUsers((prev) => prev.filter((user) => user.id !== userId));
  }

  function handleImportCsv(newUsers: User[]) {
    setImportedUsers((prev) => [...prev, ...newUsers]);
  }

  if (isLoading) {
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
        <p className="text-red-400 text-sm">{getApiErrorMessage(error)}</p>
        <button
          onClick={() => refetch()}
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
      />

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
          serverError={modalError}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
