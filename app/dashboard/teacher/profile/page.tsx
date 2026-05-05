"use client";

import { useAppSelector } from "@/store/hooks";

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-brand-muted uppercase tracking-wider">{label}</span>
      <span className="text-brand-text text-sm font-medium">{value || "—"}</span>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    ORGANIZATION_ADMIN: { label: "Admin",   cls: "bg-purple-500/15 text-purple-400" },
    TEACHER:            { label: "Teacher", cls: "bg-blue-500/15 text-blue-400" },
    STUDENT:            { label: "Student", cls: "bg-green-500/15 text-green-400" },
  };
  const { label, cls } = map[role] ?? { label: role, cls: "bg-brand-primary/15 text-brand-text" };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{label}</span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const active = status === "ACTIVE";
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${active ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export default function TeacherProfilePage() {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return (
      <div className="w-full px-6 py-10">
        <p className="text-brand-muted text-sm">Loading profile...</p>
      </div>
    );
  }

  const displayName = `${user.firstName} ${user.lastName}`.trim() || "User";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="w-full px-4 md:px-6 py-8 md:py-10 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-brand-text">My Profile</h1>
        <p className="text-sm text-brand-muted">Your account details and organization information.</p>
      </div>

      {/* Identity card */}
      <div className="rounded-2xl border border-brand-primary/15 bg-brand-card p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7c6fcd] to-[#22d3ee] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {avatarLetter}
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-brand-text text-xl font-bold truncate">{displayName}</span>
          <span className="text-brand-muted text-sm truncate">{user.email}</span>
          <div className="flex items-center gap-2 flex-wrap mt-1">
            <RoleBadge role={user.role} />
            <StatusBadge status={user.status} />
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div className="rounded-2xl border border-brand-primary/15 bg-brand-card p-5 md:p-6 space-y-4">
        <h2 className="text-brand-text font-semibold text-base">Personal Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <InfoRow label="First Name" value={user.firstName} />
          <InfoRow label="Last Name"  value={user.lastName}  />
          <InfoRow label="Email"      value={user.email}     />
          <InfoRow label="Role"       value={user.role.replace("_", " ")} />
        </div>
      </div>

      {/* Organization info */}
      <div className="rounded-2xl border border-brand-primary/15 bg-brand-card p-5 md:p-6 space-y-4">
        <h2 className="text-brand-text font-semibold text-base">Organization</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <InfoRow label="Name"    value={user.organizationName}        />
          <InfoRow label="Type"    value={user.organizationType}        />
          <InfoRow label="Country" value={user.country}                 />
          <InfoRow label="City"    value={user.city}                    />
          <InfoRow label="Phone"   value={user.organizationPhoneNumber} />
          <InfoRow label="Address" value={user.organizationAddress}     />
        </div>
      </div>
    </div>
  );
}
