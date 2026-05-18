"use client";

type Props = {
  totalUsers: number;
  onAddUser: () => void;
  onImportCsv: (file: File) => void;
  importing: boolean;
};

export default function UsersHeader({ totalUsers, onAddUser, onImportCsv, importing }: Props) {
  function handleCsvImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onImportCsv(file);
    e.target.value = "";
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-text">User Management</h1>
        <p className="text-brand-text/40 text-sm mt-1">
          {totalUsers} user{totalUsers !== 1 ? "s" : ""} total
        </p>
      </div>
      <div className="flex items-center gap-3">
        <label className={`flex items-center gap-2 px-4 py-2.5 border border-brand-primary/30 hover:bg-brand-primary/10 text-brand-text rounded-xl text-sm font-medium transition-colors ${
          importing ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        }`}>
          <span className="material-symbols-rounded" style={{ fontSize: "1.1rem" }}>upload</span>
          {importing ? "Importing..." : "Import CSV"}
          <input type="file" accept=".csv" onChange={handleCsvImport} disabled={importing} className="hidden"/>
        </label>
        <button
          onClick={onAddUser}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-brand-text rounded-xl text-sm font-medium transition-colors">
          <span className="material-symbols-rounded" style={{ fontSize: "1.1rem" }}>add</span>
          Add User
        </button>
      </div>
    </div>
  );
}
