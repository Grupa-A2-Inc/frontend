"use client";

import { FormEvent, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Organization, User, syncAuthenticatedUser } from "@/store/slices/authSlice";
import {
  changeUserPassword,
  fetchProfileOrganization,
  fetchUserProfile,
  updateProfileOrganization,
  updateUserProfile,
} from "@/lib/profile/api";
import { mapOrganizationResponse, mergeUserProfile } from "@/lib/profile/types";
import SubscriptionSettingsSection from "@/components/subscriptions/SubscriptionSettingsSection";

function SaveFeedback({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="flex items-center gap-1 text-xs text-green-400">
      <span className="material-symbols-rounded" style={{ fontSize: "1rem" }}>check_circle</span>
      Saved
    </span>
  );
}

export default function SettingsPage() {
  const user = useAppSelector((s) => s.auth.user);
  const org  = useAppSelector((s) => s.auth.organization);

  if (!user) {
    return <p className="py-10 text-center text-sm text-brand-muted">Loading settings...</p>;
  }

  return <SettingsForms user={user} org={org} />;
}

function SettingsForms({ user, org }: { user: User; org: Organization | null }) {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const token = accessToken ?? (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null);

  // ── Account fields ──────────────────────────────────────────
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName,  setLastName]  = useState(user.lastName);
  const [email,     setEmail]     = useState(user.email);
  const [accountError, setAccountError] = useState("");
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountSaved, setAccountSaved] = useState(false);

  // ── Password fields ──────────────────────────────────────────
  const [currentPassword,  setCurrentPassword]  = useState("");
  const [newPassword,      setNewPassword]      = useState("");
  const [confirmPassword,  setConfirmPassword]  = useState("");
  const [passwordError,    setPasswordError]    = useState("");
  const [passwordSaving,   setPasswordSaving]   = useState(false);
  const [passwordSaved,    setPasswordSaved]    = useState(false);

  // ── Organisation fields ──────────────────────────────────────
  const [orgName,    setOrgName]    = useState(org?.name        ?? user.organizationName);
  const [orgType,    setOrgType]    = useState(org?.type        ?? user.organizationType);
  const [orgCountry, setOrgCountry] = useState(org?.country     ?? user.country);
  const [orgCity,    setOrgCity]    = useState(org?.city        ?? user.city);
  const [orgPhone,   setOrgPhone]   = useState(org?.phoneNumber ?? user.organizationPhoneNumber);
  const [orgAddress, setOrgAddress] = useState(org?.address     ?? user.organizationAddress);
  const [orgError,   setOrgError]   = useState("");
  const [orgSaving,  setOrgSaving]  = useState(false);
  const [orgSaved,   setOrgSaved]   = useState(false);

  function flash(setter: (v: boolean) => void) {
    setter(true);
    setTimeout(() => setter(false), 2500);
  }

  async function handleSaveAccount(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAccountError("");
    setAccountSaved(false);

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setAccountError("First name, last name, and email are required.");
      return;
    }

    setAccountSaving(true);

    try {
      await updateUserProfile(
        user.id,
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          organizationId: user.organizationId,
        },
        token
      );

      const refreshed = await fetchUserProfile(user.id, token);
      const nextUser = mergeUserProfile(refreshed, user, org);
      setFirstName(nextUser.firstName);
      setLastName(nextUser.lastName);
      setEmail(nextUser.email);
      dispatch(syncAuthenticatedUser({ user: nextUser, organization: org }));
      flash(setAccountSaved);
    } catch (error) {
      setAccountError(error instanceof Error ? error.message : "Failed to update account details.");
    } finally {
      setAccountSaving(false);
    }
  }

  async function handleSavePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSaved(false);
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordSaving(true);

    try {
      await changeUserPassword(
        user.id,
        {
          currentPassword,
          newPassword,
          newPasswordConfirm: confirmPassword,
        },
        token
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      flash(setPasswordSaved);
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Failed to update password.");
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleSaveOrg(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOrgError("");
    setOrgSaved(false);

    if (!orgName.trim() || !orgType.trim() || !orgCountry.trim() || !orgCity.trim()) {
      setOrgError("Organisation name, type, country, and city are required.");
      return;
    }
    if (!user.organizationId) {
      setOrgError("Organisation ID was not found in the current session.");
      return;
    }

    setOrgSaving(true);

    try {
      await updateProfileOrganization(
        user.organizationId,
        {
          name: orgName.trim(),
          organizationType: orgType.trim(),
          country: orgCountry.trim(),
          city: orgCity.trim(),
          phoneNumber: orgPhone.trim(),
          address: orgAddress.trim(),
        },
        token
      );

      const response = await fetchProfileOrganization(user.organizationId, token);
      const nextOrganization = mapOrganizationResponse(response, user);

      if (!nextOrganization) {
        throw new Error("Failed to refresh organisation details.");
      }

      const nextUser = mergeUserProfile({}, user, nextOrganization);
      setOrgName(nextOrganization.name);
      setOrgType(nextOrganization.type);
      setOrgCountry(nextOrganization.country);
      setOrgCity(nextOrganization.city);
      setOrgPhone(nextOrganization.phoneNumber);
      setOrgAddress(nextOrganization.address);
      dispatch(syncAuthenticatedUser({ user: nextUser, organization: nextOrganization }));
      flash(setOrgSaved);
    } catch (error) {
      setOrgError(error instanceof Error ? error.message : "Failed to update organisation details.");
    } finally {
      setOrgSaving(false);
    }
  }

  const inputClass =
    "bg-brand-mid border border-brand-primary/20 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors w-full";
  const labelClass = "text-xs font-medium text-brand-text/60";

  return (
    <div className="max-w-2xl mx-auto">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-text">Settings</h1>
        <p className="text-brand-text/40 text-sm mt-1">Manage your account and organisation details.</p>
      </div>

      {/* ── ACCOUNT DETAILS ─────────────────────────────────── */}
      <section className="bg-brand-card border border-brand-primary/15 rounded-2xl p-6 mb-5">
        <h2 className="text-brand-text font-semibold text-sm mb-5">Account Details</h2>
        <form onSubmit={handleSaveAccount} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                autoComplete="given-name"
                required
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                autoComplete="family-name"
                required
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className={inputClass}
            />
          </div>
          {accountError && (
            <p className="text-red-400 text-xs">{accountError}</p>
          )}
          <div className="flex items-center gap-4 mt-1">
            <button
              type="submit"
              disabled={accountSaving}
              className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-brand-text rounded-xl text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {accountSaving ? "Saving..." : "Save Changes"}
            </button>
            <SaveFeedback show={accountSaved} />
          </div>
        </form>
      </section>

      {/* ── CHANGE PASSWORD ──────────────────────────────────── */}
      <section className="bg-brand-card border border-brand-primary/15 rounded-2xl p-6 mb-5">
        <h2 className="text-brand-text font-semibold text-sm mb-5">Change Password</h2>
        <form onSubmit={handleSavePassword} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                className={inputClass}
              />
            </div>
          </div>
          {passwordError && (
            <p className="text-red-400 text-xs">{passwordError}</p>
          )}
          <div className="flex items-center gap-4 mt-1">
            <button
              type="submit"
              disabled={passwordSaving}
              className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-brand-text rounded-xl text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {passwordSaving ? "Updating..." : "Update Password"}
            </button>
            <SaveFeedback show={passwordSaved} />
          </div>
        </form>
      </section>

      {/* ── ORGANISATION DETAILS ─────────────────────────────── */}
      <section className="bg-brand-card border border-brand-primary/15 rounded-2xl p-6 mb-5">
        <h2 className="text-brand-text font-semibold text-sm mb-5">Organisation Details</h2>
        <form onSubmit={handleSaveOrg} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Organisation Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Springfield High School"
                required
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Type</label>
              <input
                type="text"
                value={orgType}
                onChange={(e) => setOrgType(e.target.value)}
                placeholder="e.g. High School, University"
                required
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Country</label>
              <input
                type="text"
                value={orgCountry}
                onChange={(e) => setOrgCountry(e.target.value)}
                placeholder="e.g. Romania"
                required
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>City</label>
              <input
                type="text"
                value={orgCity}
                onChange={(e) => setOrgCity(e.target.value)}
                placeholder="e.g. Bucharest"
                required
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Phone Number</label>
              <input
                type="tel"
                value={orgPhone}
                onChange={(e) => setOrgPhone(e.target.value)}
                placeholder="+40 700 000 000"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Address</label>
              <input
                type="text"
                value={orgAddress}
                onChange={(e) => setOrgAddress(e.target.value)}
                placeholder="Street, number..."
                className={inputClass}
              />
            </div>
          </div>
          {orgError && (
            <p className="text-red-400 text-xs">{orgError}</p>
          )}
          <div className="flex items-center gap-4 mt-1">
            <button
              type="submit"
              disabled={orgSaving}
              className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-brand-text rounded-xl text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {orgSaving ? "Saving..." : "Save Changes"}
            </button>
            <SaveFeedback show={orgSaved} />
          </div>
        </form>
      </section>

      <SubscriptionSettingsSection />

      {/* ── DANGER ZONE ──────────────────────────────────────── */}
      <section className="border border-red-500/20 rounded-2xl p-6">
        <h2 className="text-red-400 font-semibold text-sm mb-1">Danger Zone</h2>
        <p className="text-brand-text/40 text-xs mb-5">These actions are irreversible. Proceed with caution.</p>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-brand-mid rounded-xl px-4 py-3">
            <div>
              <p className="text-brand-text text-sm font-medium">Delete Account</p>
              <p className="text-brand-text/40 text-xs mt-0.5">Permanently remove your admin account.</p>
            </div>
            <button
              disabled
              className="px-4 py-2 rounded-xl text-sm font-medium border border-red-500/30 text-red-400/40 cursor-not-allowed"
            >
              Delete
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 bg-brand-mid rounded-xl px-4 py-3">
            <div>
              <p className="text-brand-text text-sm font-medium">Deactivate Organisation</p>
              <p className="text-brand-text/40 text-xs mt-0.5">Suspend access for all users in this organisation.</p>
            </div>
            <button
              disabled
              className="px-4 py-2 rounded-xl text-sm font-medium border border-red-500/30 text-red-400/40 cursor-not-allowed"
            >
              Deactivate
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
