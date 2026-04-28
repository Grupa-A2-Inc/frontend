"use client";

import { useState } from "react";

type StatusFilter = "ALL" | "PUBLISHED" | "DRAFT" | "HIDDEN";

type Props = {
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  search: string;
  onSearchChange: (value: string) => void;
};

export default function CoursesFilters({ statusFilter, onStatusFilterChange, search, onSearchChange }: Props) {
  const [open, setOpen] = useState(false);

  const filters: StatusFilter[] = ["ALL", "PUBLISHED", "DRAFT", "HIDDEN"];

  function getLabel(value: StatusFilter) {
    return value === "ALL" ? "All" : value.charAt(0) + value.slice(1).toLowerCase();
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="hidden sm:flex items-center gap-1 bg-brand-card border border-brand-primary/20 rounded-xl p-1">
        {filters.map((value) => (
          <button key={value} onClick={() => onStatusFilterChange(value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === value ? "bg-brand-primary text-brand-text" : "text-brand-text/50 hover:text-brand-text"}`}>
            {getLabel(value)}
          </button>
        ))}
      </div>

      <div className="relative sm:hidden">
        <button onClick={() => setOpen(!open)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
            open ? "border-brand-primary text-brand-primary" : "border-brand-primary/20 text-brand-text"}`}>
          {getLabel(statusFilter)}
          <span className="text-xl">{open ? "⌃" : "⌄"}</span>
        </button>
        {open && (
          <div className="absolute top-full mt-1 left-0 z-10 bg-brand-card border border-brand-primary/20 rounded-xl overflow-hidden min-w-[140px]">
            {filters.map((value) => (
              <button key={value} onClick={() => { onStatusFilterChange(value); setOpen(false); }}
                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                  statusFilter === value ? "text-brand-primary font-medium" : "text-brand-text hover:bg-brand-primary/10"}`}>
                {getLabel(value)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/30" style={{ fontSize: "1.2rem" }}>search</span>
        <input type="text" value={search} onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search courses..."
          className="bg-brand-card border border-brand-primary/20 rounded-xl pl-10 pr-4 py-2 text-sm text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-primary/60 transition-colors"/>
      </div>

    </div>
  );
}