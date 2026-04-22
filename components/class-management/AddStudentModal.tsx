"use client";
import { useState, useEffect, useCallback } from "react";
import { Student } from "@/lib/classes/types";
import { apiFetch } from "@/lib/classes/api";
import Avatar from "@/components/class-ui/Avatar";
import Spinner from "@/components/class-ui/Spinner";

type Props = { token: string; classId: string; existingIds: string[]; onAdded: (s: Student) => void; onClose: () => void; };

export default function AddStudentModal({ token, classId, existingIds, onAdded, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Student[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) return setResults([]);
    setSearching(true);
    try {
      const data = await apiFetch<Student[]>(`/api/v1/users/search?q=${encodeURIComponent(q)}&role=STUDENT`, token);
      setResults(data.filter((s) => !existingIds.includes(s.id)));
    } catch (e) { /* silent fail for search */ } 
    finally { setSearching(false); }
  }, [token, existingIds]);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 350);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleAdd = async (student: Student) => {
    setAdding(student.id);
    try {
      await apiFetch(`/api/v1/classes/${classId}/students`, token, { method: "POST", body: JSON.stringify({ studentId: student.id }) });
      onAdded(student);
    } catch (e) { alert("Failed to add student"); }
    finally { setAdding(null); }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-brand-border bg-brand-card shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-brand-border px-6 py-4">
          <h3 className="text-base font-bold text-brand-text">Add student</h3>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-text">✕</button>
        </div>
        
        <div className="px-6 py-4">
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search students…" className="w-full rounded-xl border border-brand-border bg-brand-mid px-4 py-2.5 text-sm text-brand-text focus:outline-none" />
        </div>

        <div className="max-h-[300px] overflow-y-auto px-6 pb-6 space-y-2">
          {searching && <Spinner />}
          {!searching && results.map((student) => (
            <div key={student.id} className="flex items-center justify-between rounded-xl border border-brand-border bg-brand-mid/40 px-4 py-3">
               <div className="flex items-center gap-3">
                  <Avatar name={`${student.firstName} ${student.lastName}`} size="sm" />
                  <div>
                    <p className="text-sm font-semibold">{student.firstName} {student.lastName}</p>
                    <p className="text-xs text-brand-muted">{student.email}</p>
                  </div>
               </div>
               <button onClick={() => handleAdd(student)} disabled={!!adding} className="bg-brand-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50">
                 {adding === student.id ? "..." : "Add"}
               </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}