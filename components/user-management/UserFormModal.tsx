"use client";

import { useState } from "react";
import { User, UserRole, CreateUserPayload } from "@/store/slices/usersSlice";
import ClassSelector from "./UsersClassSelector";

type Props = {
  user: User | null;
  onClose: () => void;
  onSave: (data: CreateUserPayload) => void;
};

export default function UserFormModal({ user, onClose, onSave }: Props) {
  const [firstName, setFirstName]             = useState(user?.firstName ?? "");
  const [lastName, setLastName]               = useState(user?.lastName  ?? "");
  const [email, setEmail]                     = useState(user?.email     ?? "");
  const [password, setPassword]               = useState("");
  const [role, setRole]                       = useState<UserRole>(user?.role ?? "STUDENT");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [validationError, setValidationError] = useState("");

  const isEditing = user !== null;

  //selectie clasa
  function toggleClass(classId: string) {
    setSelectedClasses((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId]
    );
  }

  //Validare si salvare
  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim()) { setValidationError("First name is required.");  return; }
    if (!lastName.trim())  { setValidationError("Last name is required.");   return; }
    if (!email.trim())     { setValidationError("Email is required.");       return; }
    if (!isEditing && !password.trim()) { setValidationError("Password is required."); return; }
    setValidationError("");
    onSave({ firstName, lastName, email, password, role });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-brand-card border border-brand-primary/20 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">

        {/*HEADER*/}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-brand-text font-semibold text-lg">
            {isEditing ? "Edit User" : "Add User"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-brand-text/40 hover:text-brand-text hover:bg-brand-text/10 transition-colors"
          >
            <span className="material-symbols-rounded" style={{ fontSize: "1.2rem" }}>close</span>
          </button>
        </div>

        {/*FORMULAR*/}
        <form onSubmit={handleSave} className="flex flex-col gap-4">

          {/* First Name + Last Name */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-medium text-brand-text/60">
                First Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Ion"
                className="bg-brand-mid border border-brand-primary/20 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-medium text-brand-text/60">
                Last Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Mihai"
                className="bg-brand-mid border border-brand-primary/20 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-brand-text/60">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. ion.mihai@school.com"
              className="bg-brand-mid border border-brand-primary/20 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors"
            />
          </div>

          {/* Parola (doar la creare) */}
          {!isEditing && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-brand-text/60">
                Password <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="bg-brand-mid border border-brand-primary/20 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors"
              />
            </div>
          )}

          {/* Rol */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-brand-text/60">Role</label>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value as UserRole);
                setSelectedClasses([]);
              }}
              className="bg-brand-mid border border-brand-primary/20 rounded-xl px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-primary/60 transition-colors"
            >
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
            </select>
          </div>

          {/* Clase (doar pentru Teacher) */}
          {role === "TEACHER" && (
            <ClassSelector
              selectedClasses={selectedClasses}
              onToggle={toggleClass}
            />
          )}

          {/* Eroare validare */}
          {validationError && (
            <p className="text-red-400 text-sm font-medium">{validationError}</p>
          )}

          {/* Butoane */}
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-brand-text/60 hover:text-brand-text border border-brand-primary/20 hover:bg-brand-text/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-brand-primary hover:bg-brand-primary/90 text-brand-text transition-colors"
            >
              {isEditing ? "Save Changes" : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}