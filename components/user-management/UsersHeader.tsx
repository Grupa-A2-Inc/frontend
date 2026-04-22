"use client";

import { User, UserRole } from "@/store/slices/usersSlice";

type Props = {
  totalUsers: number;
  onAddUser: () => void;
  onImportCsv: (newUsers: User[]) => void;
};

export default function UsersHeader({ totalUsers, onAddUser, onImportCsv }: Props) {

  // CSV Import
  function handleCsvImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim() !== "");

      // Sarim peste header (prima linie)
      const newUsers: User[] = lines.slice(1).map((line, index) => {
        const [firstName, lastName, email, role] = line.split(",").map((s) => s.trim());
        return {
          id: String(Date.now() + index),
          firstName: firstName ?? "",
          lastName:  lastName  ?? "",
          email:     email     ?? "",
          role:      (role?.toUpperCase() === "TEACHER" ? "TEACHER" : "STUDENT") as UserRole,
          status:    "ACTIVE",
        };
      });

      onImportCsv(newUsers);
    };
    reader.readAsText(file);

    // Resetam input-ul ca sa poata fi refolosit
    e.target.value = "";
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      {/*TITLU*/}
      <div>
        <h1 className="text-2xl font-bold text-brand-text">User Management</h1>
        <p className="text-brand-text/40 text-sm mt-1">
          {totalUsers} user{totalUsers !== 1 ? "s" : ""} total
        </p>
      </div>

      {/*  BUTOANE */}
      <div className="flex items-center gap-3">
        {/* Buton CSV Import */}
        <label className="flex items-center gap-2 px-4 py-2.5 border border-brand-primary/30 hover:bg-brand-primary/10 text-brand-text rounded-xl text-sm font-medium transition-colors cursor-pointer">
          <span className="material-symbols-rounded" style={{ fontSize: "1.1rem" }}>upload</span>
          Import CSV
          <input
            type="file"
            accept=".csv"
            onChange={handleCsvImport}
            className="hidden"
          />
        </label>

        {/* Buton Add User */}
        <button
          onClick={onAddUser}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-brand-text rounded-xl text-sm font-medium transition-colors"
        >
          <span className="material-symbols-rounded" style={{ fontSize: "1.1rem" }}>add</span>
          Add User
        </button>
      </div>
    </div>
  );
}