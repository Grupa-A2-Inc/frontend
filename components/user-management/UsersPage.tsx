"use client";

import { useState, useEffect } from "react";
import { User, CreateUserPayload, fetchUsers, createUser, toggleUserStatus, deleteUser, addUsersLocally, updateUser } from "@/store/slices/usersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import UsersHeader from "./UsersHeader";
import UsersToolbar from "./UsersToolbar";
import UsersTable from "./UsersTable";
import UserFormModal from "./UserFormModal";

type RoleFilter = "ALL" | "STUDENT" | "TEACHER";
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector((state) => state.users);
  const { accessToken, user: authUser } = useAppSelector((state) => state.auth);
  const token = accessToken ?? (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null) ?? "";

  const [search, setSearch]             = useState("");
  const [roleFilter, setRoleFilter]     = useState<RoleFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [showModal, setShowModal]       = useState(false);
  const [editingUser, setEditingUser]   = useState<User | null>(null);

  useEffect(() => {
    if (!token) return;
    dispatch(fetchUsers(token));
  }, [token, dispatch]);

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

  async function handleSave(data: CreateUserPayload) {
    if (editingUser) {
      const result = await dispatch(updateUser({
        token,
        userId: editingUser.id,
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        }
      }));
      console.log("updateUser result:", result);
      closeModal();
    } else {
      const result = await dispatch(createUser({
        token,
        data: {
          ...data,
          roleName: data.role,
          organizationId: authUser?.organizationId,
        }
      }));
      if (createUser.fulfilled.match(result)) {
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

  function handleImportCsv(newUsers: User[]) {
    dispatch(addUsersLocally(newUsers));
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
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}