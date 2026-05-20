"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Loader2, Lock, RefreshCw, Save, UserRound } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Organization, User, syncAuthenticatedUser } from "@/store/slices/authSlice";
import {
  changeUserPassword,
  fetchProfileOrganization,
  fetchUserProfile,
  updateUserProfile,
} from "@/lib/profile/api";
import {
  BackendUserResponse,
  mapOrganizationResponse,
  mergeUserProfile,
} from "@/lib/profile/types";

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
};

function getStoredToken(accessToken?: string | null): string | null {
  if (accessToken) return accessToken;
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

function roleLabel(role: string): string {
  const labels: Record<string, string> = {
    ADMIN: "Admin",
    ORGANIZATION_ADMIN: "Admin",
    TEACHER: "Teacher",
    STUDENT: "Student",
  };

  return labels[role] ?? role.replace("_", " ");
}

function roleClass(role: string): string {
  if (role === "ORGANIZATION_ADMIN" || role === "ADMIN") return "bg-purple-500/15 text-purple-300";
  if (role === "TEACHER") return "bg-blue-500/15 text-blue-300";
  if (role === "STUDENT") return "bg-green-500/15 text-green-300";
  return "bg-brand-primary/15 text-brand-text";
}

function StatusBadge({ status }: { status: string }) {
  const active = status === "ACTIVE";

  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        active ? "bg-green-500/15 text-green-300" : "bg-red-500/15 text-red-300"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function ReadOnlyField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-brand-primary/10 bg-brand-mid/40 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-brand-text">{value?.trim() || "-"}</p>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-brand-text/60">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-xl border border-brand-primary/20 bg-brand-mid px-4 py-2.5 text-sm text-brand-text outline-none transition-colors placeholder:text-brand-muted/60 focus:border-brand-primary/60"
      />
    </label>
  );
}

function Message({ variant, children }: { variant: "success" | "error" | "warning"; children: string }) {
  const classes = {
    success: "border-green-500/30 bg-green-500/10 text-green-300",
    error: "border-red-500/30 bg-red-500/10 text-red-300",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  };

  return (
    <p className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${classes[variant]}`}>
      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const authUserRef = useRef<User | null>(authUser);

  const [profile, setProfile] = useState<User | null>(authUser);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    firstName: authUser?.firstName ?? "",
    lastName: authUser?.lastName ?? "",
    email: authUser?.email ?? "",
  });
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState("");
  const [organizationWarning, setOrganizationWarning] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const token = useMemo(() => getStoredToken(accessToken), [accessToken]);

  useEffect(() => {
    authUserRef.current = authUser;
  }, [authUser]);

  const hydrateProfile = useCallback(async (options: { quiet?: boolean } = {}) => {
    const currentAuthUser = authUserRef.current;

    if (!currentAuthUser?.id) {
      setLoading(false);
      return;
    }

    if (options.quiet) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");
    setOrganizationWarning("");

    try {
      const backendUser = await fetchUserProfile(currentAuthUser.id, token);
      const organizationId = backendUser.organizationId ?? currentAuthUser.organizationId;
      let nextOrganization = mapOrganizationResponse(null, currentAuthUser);

      if (organizationId) {
        try {
          const backendOrganization = await fetchProfileOrganization(organizationId, token);
          nextOrganization = mapOrganizationResponse(backendOrganization, currentAuthUser);
        } catch (organizationError) {
          setOrganizationWarning(
            organizationError instanceof Error
              ? organizationError.message
              : "Could not refresh organization details."
          );
        }
      }

      const nextProfile = mergeUserProfile(backendUser, currentAuthUser, nextOrganization);
      setProfile(nextProfile);
      setOrganization(nextOrganization);
      setProfileForm({
        firstName: nextProfile.firstName,
        lastName: nextProfile.lastName,
        email: nextProfile.email,
      });
      dispatch(syncAuthenticatedUser({ user: nextProfile, organization: nextOrganization }));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load profile.");
      setProfile(currentAuthUser);
      setProfileForm({
        firstName: currentAuthUser.firstName,
        lastName: currentAuthUser.lastName,
        email: currentAuthUser.email,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dispatch, token]);

  useEffect(() => {
    hydrateProfile();
  }, [authUser?.id, hydrateProfile]);

  function setProfileField<K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) {
    setProfileForm((current) => ({ ...current, [field]: value }));
    setProfileSuccess("");
  }

  function setPasswordField<K extends keyof PasswordForm>(field: K, value: PasswordForm[K]) {
    setPasswordForm((current) => ({ ...current, [field]: value }));
    setPasswordError("");
    setPasswordSuccess("");
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileSuccess("");
    setError("");

    if (!profile) return;
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim() || !profileForm.email.trim()) {
      setError("First name, last name, and email are required.");
      return;
    }

    setSavingProfile(true);

    try {
      await updateUserProfile(
        profile.id,
        {
          firstName: profileForm.firstName.trim(),
          lastName: profileForm.lastName.trim(),
          email: profileForm.email.trim(),
          organizationId: profile.organizationId,
        },
        token
      );

      const refreshedUser: BackendUserResponse = await fetchUserProfile(profile.id, token);
      const nextProfile = mergeUserProfile(refreshedUser, profile, organization);
      setProfile(nextProfile);
      setProfileForm({
        firstName: nextProfile.firstName,
        lastName: nextProfile.lastName,
        email: nextProfile.email,
      });
      dispatch(syncAuthenticatedUser({ user: nextProfile, organization }));
      setProfileSuccess("Profile details were saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!profile) return;
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.newPasswordConfirm) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setSavingPassword(true);

    try {
      await changeUserPassword(profile.id, passwordForm, token);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        newPasswordConfirm: "",
      });
      setPasswordSuccess("Password was updated.");
    } catch (saveError) {
      setPasswordError(saveError instanceof Error ? saveError.message : "Failed to update password.");
    } finally {
      setSavingPassword(false);
    }
  }

  if (!authUser || loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-10">
        <div className="flex items-center gap-3 text-sm text-brand-muted">
          <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />
          Loading profile...
        </div>
      </div>
    );
  }

  const displayedProfile = profile ?? authUser;
  const displayedOrganization = organization ?? mapOrganizationResponse(null, displayedProfile);
  const displayName =
    `${displayedProfile.firstName} ${displayedProfile.lastName}`.trim() || displayedProfile.email || "User";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="w-full max-w-4xl space-y-6 px-4 py-8 md:px-6 md:py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-text md:text-3xl">My Profile</h1>
          <p className="mt-1 text-sm text-brand-muted">Account details loaded from the backend.</p>
        </div>
        <button
          type="button"
          onClick={() => hydrateProfile({ quiet: true })}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-brand-primary/20 px-4 py-2 text-sm font-semibold text-brand-text transition-colors hover:bg-brand-mid disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </button>
      </div>

      {error && <Message variant="error">{error}</Message>}
      {organizationWarning && <Message variant="warning">{organizationWarning}</Message>}

      <section className="flex flex-col gap-4 rounded-2xl border border-brand-primary/15 bg-brand-card p-5 md:flex-row md:items-center md:p-6">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7c6fcd] to-[#22d3ee] text-2xl font-bold text-white">
          {avatarLetter}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xl font-bold text-brand-text">{displayName}</p>
          <p className="truncate text-sm text-brand-muted">{displayedProfile.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleClass(displayedProfile.role)}`}>
              {roleLabel(displayedProfile.role)}
            </span>
            <StatusBadge status={displayedProfile.status} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-primary/15 bg-brand-card p-5 md:p-6">
        <div className="mb-5 flex items-center gap-2">
          <UserRound className="h-4 w-4 text-brand-primary" />
          <h2 className="text-sm font-semibold text-brand-text">Personal Information</h2>
        </div>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="First Name"
              value={profileForm.firstName}
              onChange={(value) => setProfileField("firstName", value)}
              autoComplete="given-name"
              required
            />
            <TextField
              label="Last Name"
              value={profileForm.lastName}
              onChange={(value) => setProfileField("lastName", value)}
              autoComplete="family-name"
              required
            />
          </div>
          <TextField
            label="Email"
            value={profileForm.email}
            onChange={(value) => setProfileField("email", value)}
            type="email"
            autoComplete="email"
            required
          />
          {profileSuccess && <Message variant="success">{profileSuccess}</Message>}
          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-brand-primary/15 bg-brand-card p-5 md:p-6">
        <div className="mb-5 flex items-center gap-2">
          <Lock className="h-4 w-4 text-brand-primary" />
          <h2 className="text-sm font-semibold text-brand-text">Change Password</h2>
        </div>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <TextField
            label="Current Password"
            value={passwordForm.currentPassword}
            onChange={(value) => setPasswordField("currentPassword", value)}
            type="password"
            autoComplete="current-password"
            required
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="New Password"
              value={passwordForm.newPassword}
              onChange={(value) => setPasswordField("newPassword", value)}
              type="password"
              autoComplete="new-password"
              required
            />
            <TextField
              label="Confirm New Password"
              value={passwordForm.newPasswordConfirm}
              onChange={(value) => setPasswordField("newPasswordConfirm", value)}
              type="password"
              autoComplete="new-password"
              required
            />
          </div>
          {passwordError && <Message variant="error">{passwordError}</Message>}
          {passwordSuccess && <Message variant="success">{passwordSuccess}</Message>}
          <button
            type="submit"
            disabled={savingPassword}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Update Password
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-brand-primary/15 bg-brand-card p-5 md:p-6">
        <h2 className="mb-5 text-sm font-semibold text-brand-text">Organization</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ReadOnlyField label="Name" value={displayedOrganization?.name} />
          <ReadOnlyField label="Type" value={displayedOrganization?.type} />
          <ReadOnlyField label="Country" value={displayedOrganization?.country} />
          <ReadOnlyField label="City" value={displayedOrganization?.city} />
          <ReadOnlyField label="Phone" value={displayedOrganization?.phoneNumber} />
          <ReadOnlyField label="Address" value={displayedOrganization?.address} />
        </div>
      </section>
    </div>
  );
}
