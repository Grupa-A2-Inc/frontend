"use client";

import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { loadUserFromStorage } from "@/store/slices/authSlice";

// Build a fake JWT whose payload our expiry-check can decode.
// The signature is not verified client-side, so anything works there.
function makeFakeJwt(sub: string, role: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header  = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ sub, role, iat: now, exp: now + 7 * 24 * 3600 }));
  return `${header}.${payload}.mock_dev_signature`;
}

const MOCKS = {
  ORGANIZATION_ADMIN: {
    id: "mock-admin-001",
    firstName: "Admin",
    lastName: "Mock",
    email: "admin@dev.local",
    role: "ORGANIZATION_ADMIN" as const,
    status: "ACTIVE" as const,
    organizationId: "mock-org-001",
    organizationName: "Dev School",
    organizationType: "High School",
    country: "Romania",
    city: "Bucharest",
    organizationPhoneNumber: "0700000001",
    organizationAddress: "Dev Street 1",
  },
  TEACHER: {
    id: "mock-teacher-001",
    firstName: "Teacher",
    lastName: "Mock",
    email: "teacher@dev.local",
    role: "TEACHER" as const,
    status: "ACTIVE" as const,
    organizationId: "mock-org-001",
    organizationName: "Dev School",
    organizationType: "High School",
    country: "Romania",
    city: "Bucharest",
    organizationPhoneNumber: "0700000002",
    organizationAddress: "Dev Street 1",
  },
  STUDENT: {
    id: "mock-student-001",
    firstName: "Student",
    lastName: "Mock",
    email: "student@dev.local",
    role: "STUDENT" as const,
    status: "ACTIVE" as const,
    organizationId: "mock-org-001",
    organizationName: "Dev School",
    organizationType: "High School",
    country: "Romania",
    city: "Bucharest",
    organizationPhoneNumber: "0700000003",
    organizationAddress: "Dev Street 1",
  },
};

const DASHBOARDS = {
  ORGANIZATION_ADMIN: "/dashboard/admin",
  TEACHER: "/dashboard/teacher",
  STUDENT: "/dashboard/student",
};

const LABELS = {
  ORGANIZATION_ADMIN: { icon: "admin_panel_settings", label: "Admin",   color: "from-violet-500 to-purple-600" },
  TEACHER:            { icon: "school",                label: "Teacher", color: "from-blue-500 to-cyan-600"    },
  STUDENT:            { icon: "person",                label: "Student", color: "from-emerald-500 to-teal-600" },
};

export default function DevLoginPage() {
  const router   = useRouter();
  const dispatch = useAppDispatch();

  function loginAs(role: keyof typeof MOCKS) {
    const user  = MOCKS[role];
    const token = makeFakeJwt(user.id, role);

    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("mockAuth", "true");

    // Also set cookies so proxy middleware can read them
    document.cookie = `accessToken=${token}; path=/;`;
    document.cookie = `role=${role}; path=/;`;

    dispatch(loadUserFromStorage());
    router.push(DASHBOARDS[role]);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg gap-8 p-8">
      {/* Warning banner */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 text-sm">
        <span className="material-symbols-rounded" style={{ fontSize: "1.1rem" }}>warning</span>
        Dev-only mock login — no backend required. Data is fake.
      </div>

      <div className="bg-brand-card border border-brand-primary/15 rounded-2xl p-8 w-full max-w-sm shadow-xl">
        <h1 className="text-xl font-bold text-brand-text mb-1">Quick Login</h1>
        <p className="text-brand-text/40 text-sm mb-7">Pick a role to jump straight into that dashboard.</p>

        <div className="flex flex-col gap-3">
          {(Object.keys(MOCKS) as Array<keyof typeof MOCKS>).map((role) => {
            const { icon, label, color } = LABELS[role];
            const user = MOCKS[role];
            return (
              <button
                key={role}
                onClick={() => loginAs(role)}
                className="flex items-center gap-4 p-4 rounded-xl border border-brand-primary/15 hover:border-brand-primary/40 hover:bg-brand-primary/5 transition-all text-left group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                  <span className="material-symbols-rounded text-white" style={{ fontSize: "1.2rem" }}>{icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-brand-text">{label}</p>
                  <p className="text-xs text-brand-muted truncate">{user.email}</p>
                </div>
                <span className="material-symbols-rounded text-brand-primary/30 group-hover:text-brand-primary transition-colors" style={{ fontSize: "1.1rem" }}>
                  arrow_forward
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-brand-text/20 text-xs">
        Real login: <a href="/login" className="text-brand-primary hover:underline">/login</a>
      </p>
    </div>
  );
}
