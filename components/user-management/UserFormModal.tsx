"use client";

import { useEffect, useRef, useState } from "react";
import { User, UserRole } from "@/store/slices/usersSlice";
import ClassSelector from "./UsersClassSelector";

type SavePayload = {
  firstName: string;
  lastName: string;
  email: string;
  roleName?: string;
};

type Props = {
  user: User | null;
  serverError?: string | null;
  onClose: () => void;
  onSave: (data: SavePayload) => Promise<void>;
};

export default function UserFormModal({ user, serverError, onClose, onSave }: Props) {
  const [firstName, setFirstName]             = useState(user?.firstName ?? "");
  const [lastName, setLastName]               = useState(user?.lastName  ?? "");
  const [email, setEmail]                     = useState(user?.email     ?? "");
  const [roleName, setRoleName]               = useState<UserRole>(user?.role ?? "STUDENT");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [validationError, setValidationError] = useState("");
  const [isSubmitting, setIsSubmitting]       = useState(false);
  const isSubmittingRef = useRef(false);
  const isMounted = useRef(true);

  const isEditing = user !== null;

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  function toggleClass(classId: string) {
    setSelectedClasses((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmittingRef.current) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!firstName.trim())           { setValidationError("First name is required."); return; }
    if (!lastName.trim())            { setValidationError("Last name is required.");  return; }
    if (!emailRegex.test(email.trim())) { setValidationError("Please enter a valid email address."); return; }
    setValidationError("");
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      await onSave({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), roleName });
    } finally {
      isSubmittingRef.current = false;
      if (isMounted.current) {
        setIsSubmitting(false);
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm"><div className="min-h-full flex items-center justify-center p-4">
      <div className="bg-brand-card border border-brand-primary/20 rounded-2xl w-full max-w-md shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-primary/10">
          <h2 className="text-brand-text font-semibold text-base">
            {isEditing ? "Edit User" : "Add User"}
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-brand-text/40 hover:text-brand-text hover:bg-brand-text/10 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="material-symbols-rounded" style={{ fontSize: "1.1rem" }}>close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="px-5 py-4 flex flex-col gap-3">

          {/* First Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-brand-text/60">
              First Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isSubmitting}
              placeholder="e.g. John"
              className="bg-brand-mid border border-brand-primary/20 rounded-lg px-3 py-2 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* Last Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-brand-text/60">
              Last Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isSubmitting}
              placeholder="e.g. Smith"
              className="bg-brand-mid border border-brand-primary/20 rounded-lg px-3 py-2 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-brand-text/60">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              placeholder="e.g. john.smith@school.com"
              className="bg-brand-mid border border-brand-primary/20 rounded-lg px-3 py-2 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* Role — create only */}
          {!isEditing && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-brand-text/60">Role</label>
              <select
                value={roleName}
                onChange={(e) => { setRoleName(e.target.value as UserRole); setSelectedClasses([]); }}
                disabled={isSubmitting}
                className="bg-brand-mid border border-brand-primary/20 rounded-lg px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-primary/60 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
              </select>
            </div>
          )}

          {/* Class selector — create teacher only */}
          {!isEditing && roleName === "TEACHER" && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-brand-text/60">
                Assign to Classes <span className="text-brand-text/30 font-normal">(optional)</span>
              </label>
              <div className="max-h-28 overflow-y-auto">
                <ClassSelector selectedClasses={selectedClasses} onToggle={toggleClass} />
              </div>
              {selectedClasses.length > 0 && (
                <p className="text-xs text-brand-primary">
                  {selectedClasses.length} class{selectedClasses.length !== 1 ? "es" : ""} selected
                </p>
              )}
            </div>
          )}

          {/* Note about password */}
          {!isEditing && (
            <p className="text-xs text-brand-muted">
              The user will receive an email to set their password.
            </p>
          )}

          {(validationError || serverError) && (
            <p className="text-red-400 text-xs font-medium">{validationError || serverError}</p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2 rounded-lg text-sm font-medium text-brand-text/60 hover:text-brand-text border border-brand-primary/20 hover:bg-brand-text/5 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 rounded-lg text-sm font-medium bg-brand-primary hover:bg-brand-primary/90 text-brand-text transition-colors disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-brand-primary"
            >
              {isSubmitting ? (isEditing ? "Saving..." : "Adding...") : (isEditing ? "Save Changes" : "Add User")}
            </button>
          </div>
        </form>
      </div>
    </div></div>
  );
}
