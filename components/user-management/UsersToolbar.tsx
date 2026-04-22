"use client";

import { User } from "@/store/slices/usersSlice";

type RoleFilter = "ALL" | "STUDENT" | "TEACHER";
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

type Props = {
  users: User[];
  search: string;
  onSearchChange: (value: string) => void;
  roleFilter: RoleFilter;
  onRoleFilterChange: (value: RoleFilter) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
};

export default function UsersToolbar({
  users,
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
}: Props) {
  const studentCount = users.filter((u) => u.role === "STUDENT").length;
  const teacherCount = users.filter((u) => u.role === "TEACHER").length;

  //Role tabs
  const roleTabs: { label: string; value: RoleFilter; count: number }[] = [
    { label: "All",      value: "ALL",     count: users.length  },
    { label: "Students", value: "STUDENT", count: studentCount  },
    { label: "Teachers", value: "TEACHER", count: teacherCount  },
  ];

  //Status tabs
  const statusTabs: { label: string; value: StatusFilter }[] = [
    { label: "All",      value: "ALL"      },
    { label: "Active",   value: "ACTIVE"   },
    { label: "Inactive", value: "INACTIVE" },
  ];

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/*ROLE TABS*/}
      <div className="flex items-center gap-1 bg-brand-card border border-brand-primary/20 rounded-xl p-1 w-fit">
        {roleTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onRoleFilterChange(tab.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              roleFilter === tab.value
                ? "bg-brand-primary text-brand-text"
                : "text-brand-text/50 hover:text-brand-text"
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              roleFilter === tab.value
                ? "bg-brand-text/20 text-brand-text"
                : "bg-brand-text/10 text-brand-muted"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/*SEARCH + STATUS*/}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <span
            className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/30"
            style={{ fontSize: "1.2rem" }}
          >
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-brand-card border border-brand-primary/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-primary/60 transition-colors"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 bg-brand-card border border-brand-primary/20 rounded-xl p-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onStatusFilterChange(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === tab.value
                  ? "bg-brand-primary text-brand-text"
                  : "text-brand-text/50 hover:text-brand-text"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}