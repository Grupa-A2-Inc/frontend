"use client";

import { User } from "@/store/slices/usersSlice";

type RoleFilter = "ALL" | "STUDENT" | "TEACHER";
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

type Props = {
  filtered: User[];
  search: string;
  roleFilter: RoleFilter;
  statusFilter: StatusFilter;
  onEdit: (user: User) => void;
  onToggleStatus: (userId: string) => void;
  onDelete: (userId: string) => void;
};

export default function UsersTable({ filtered, search, roleFilter, statusFilter, onEdit, onToggleStatus, onDelete }: Props) {

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <span className="material-symbols-rounded text-brand-text/15" style={{ fontSize: "3rem" }}>
          group
        </span>
        <p className="text-brand-text/40 text-sm">
          {search || roleFilter !== "ALL" || statusFilter !== "ALL"
            ? "No users match your filters."
            : "No users yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-brand-card border border-brand-primary/15 rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-brand-primary/15">
            <th className="text-left px-5 py-3 text-xs font-medium text-brand-text/40">User</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-brand-text/40">Email</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-brand-text/40">Role</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-brand-text/40">Status</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-brand-text/40">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((user) => (
            <tr key={user.id} className="border-b border-brand-primary/8 hover:bg-brand-primary/5 transition-colors">

              {/* ---- Nume ---- */}
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary text-sm font-semibold flex-shrink-0">
                    {user.firstName.charAt(0)}
                  </div>
                  <span className="text-sm text-brand-text font-medium">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
              </td>

              {/* ---- Email ---- */}
              <td className="px-5 py-3 text-sm text-brand-text/50">{user.email}</td>

              {/* ---- Rol ---- */}
              <td className="px-5 py-3">
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-brand-primary/15 text-brand-primary">
                  {user.role === "STUDENT" ? "Student" : "Teacher"}
                </span>
              </td>

              {/* ---- Status ---- */}
              <td className="px-5 py-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  user.status === "ACTIVE"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-red-500/15 text-red-400"
                }`}>
                  {user.status === "ACTIVE" ? "Active" : "Inactive"}
                </span>
              </td>

              {/* ---- Actiuni ---- */}
              <td className="px-5 py-3">
                <div className="flex items-center gap-1">
                  {/* Edit */}
                  <button
                    onClick={() => onEdit(user)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-brand-text/30 hover:text-brand-primary hover:bg-brand-primary/10 transition-colors"
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: "1rem" }}>edit</span>
                  </button>
                  {/* Activate/Deactivate */}
                  <button
                    onClick={() => onToggleStatus(user.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-brand-text/30 hover:text-emerald-400 hover:bg-emerald-400/10 transition-colors"
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: "1rem" }}>
                      {user.status === "ACTIVE" ? "pause" : "play_arrow"}
                    </span>
                  </button>
                  {/* Delete */}
                  <button
                    onClick={() => onDelete(user.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-brand-text/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: "1rem" }}>delete</span>
                  </button>
                </div>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}