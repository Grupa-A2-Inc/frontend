"use client";

import { useState, useEffect } from "react";
import {
  User,
  UserRole,
  UserRoleFilter,
  UserStatusFilter,
  FetchUsersParams,
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
import UsersPagination from "./UsersPagination";
import UserFormModal from "./UserFormModal";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { API_BASE } from "@/lib/config";

type SavePayload = {
  firstName: string;
  lastName: string;
  email: string;
  roleName?: UserRole;
  classIds?: string[];
};

const DEFAULT_PAGE_SIZE = 10;

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const {
    users,
    loading,
    error,
    createError,
    importing,
    importError,
    importResult,
    pagination,
  } = useAppSelector((state) => state.users);
  const { accessToken, user: authUser } = useAppSelector((state) => state.auth);
  const token = accessToken ?? (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null) ?? "";
  const usersScope: FetchUsersParams["scope"] = authUser?.role === "ADMIN" ? "global" : "organization";

  const [search, setSearch]             = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter]     = useState<UserRoleFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("ALL");
  const [page, setPage]                 = useState(0);
  const [pageSize, setPageSize]         = useState(DEFAULT_PAGE_SIZE);
  const [showModal, setShowModal]       = useState(false);
  const [editingUser, setEditingUser]   = useState<User | null>(null);
  const [saveError, setSaveError]       = useState<string | null>(null);
  const [statusActionError, setStatusActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    dispatch(fetchClassrooms(token));
  }, [token, dispatch]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    if (!token) return;
    dispatch(fetchUsers({
      token,
      scope: usersScope,
      page,
      size: pageSize,
      search: debouncedSearch,
      role: roleFilter,
      status: statusFilter,
    }));
  }, [token, dispatch, usersScope, page, pageSize, debouncedSearch, roleFilter, statusFilter]);

  const userFetchParams: FetchUsersParams = {
    token,
    scope: usersScope,
    page,
    size: pageSize,
    search: debouncedSearch,
    role: roleFilter,
    status: statusFilter,
  };

  function openAddModal()         { setEditingUser(null); setSaveError(null); setShowModal(true);  }
  function openEditModal(u: User) { setEditingUser(u);    setSaveError(null); setShowModal(true);  }
  function closeModal()           { setShowModal(false);  setEditingUser(null); setSaveError(null);}

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(0);
  }

  function handleRoleFilterChange(value: UserRoleFilter) {
    setRoleFilter(value);
    setPage(0);
  }

  function handleStatusFilterChange(value: UserStatusFilter) {
    setStatusFilter(value);
    setPage(0);
  }

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPage(0);
  }

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
            dispatch(fetchUsers(userFetchParams));
            return;
          }

          try {
            await assignUserToClasses(createdUser.id, selectedClassIds);
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to assign teacher to selected classes";
            setSaveError(`Teacher was created, but class assignment failed: ${message}`);
            dispatch(fetchUsers(userFetchParams));
            return;
          }
        }

        setPage(0);
        dispatch(fetchUsers({ ...userFetchParams, page: 0 }));
        closeModal();
      }
    }
  }

  async function handleToggleStatus(userId: string) {
    setStatusActionError(null);

    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    if (user.id === authUser?.id && newStatus === "INACTIVE") {
      setStatusActionError("You cannot deactivate your own admin account.");
      return;
    }

    const result = await dispatch(toggleUserStatus({ token, userId, status: newStatus }));
    if (toggleUserStatus.fulfilled.match(result)) {
      dispatch(fetchUsers(userFetchParams));
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    const result = await dispatch(deleteUser({ token, userId }));
    if (deleteUser.fulfilled.match(result)) {
      const nextPage = users.length === 1 && page > 0 ? page - 1 : page;
      setPage(nextPage);
      dispatch(fetchUsers({ ...userFetchParams, page: nextPage }));
    }
  }

  async function handleImportCsv(file: File) {
    dispatch(importUsersCsvStarted());

    try {
      const result = await uploadUsersCsv(token, file);
      dispatch(importUsersCsvSucceeded(result));
      setPage(0);
      dispatch(fetchUsers({ ...userFetchParams, page: 0 }));
    } catch (error) {
      dispatch(importUsersCsvFailed(error instanceof Error ? error.message : "Failed to import CSV"));
    }
  }

  if (loading && users.length === 0) {
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
          onClick={() => dispatch(fetchUsers(userFetchParams))}
          className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <UsersHeader
        totalUsers={pagination.totalElements}
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

      {statusActionError && (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {statusActionError}
        </p>
      )}

      <UsersToolbar
        users={users}
        search={search}
        onSearchChange={handleSearchChange}
        roleFilter={roleFilter}
        onRoleFilterChange={handleRoleFilterChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
      />

      <div className="flex-1">
        <UsersTable
          filtered={users}
          search={search}
          roleFilter={roleFilter}
          statusFilter={statusFilter}
          onEdit={openEditModal}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
          currentUserId={authUser?.id}
        />
      </div>

      <UsersPagination
        pagination={pagination}
        loading={loading}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
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
