"use client";
import { useState } from "react";
import { ClassDetails } from "@/lib/classes/types";
import { apiFetch } from "@/lib/classes/api";
import Spinner from "@/components/class-ui/Spinner";

type Props = {
  cls: ClassDetails;
  token: string;
  onSaved: (updated: Partial<ClassDetails>) => void;
  onCancel: () => void;
};

export default function EditInfoPanel({ cls, token, onSaved, onCancel }: Props) {
  const [form, setForm] = useState({ name: cls.name, description: cls.description, subject: cls.subject, grade: cls.grade, year: cls.year });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/v1/classes/${cls.id}`, token, { method: "PATCH", body: JSON.stringify(form) });
      onSaved(form);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full rounded-xl border border-brand-border bg-brand-card px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition";

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-brand-text">Edit class info</h3>
        <button onClick={onCancel} className="text-brand-muted hover:text-brand-text">✕</button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold uppercase text-brand-muted mb-1 block">Numele clasei</label>
          <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-brand-muted mb-1 block">Materie</label>
          <input className={inputCls} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        </div>
        <div>
    <label className="text-xs font-semibold uppercase text-brand-muted mb-1 block">An Academic</label>
    <input 
      className={inputCls} 
      value={form.year} 
      onChange={(e) => setForm({ ...form, year: e.target.value })} 
    />
  </div>
        <div>
          <label className="text-xs font-semibold uppercase text-brand-muted mb-1 block">Clasa</label>
          <input className={inputCls} value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} />
        </div>
      </div>
      <div className="sm:col-span-2">
    <label className="text-xs font-semibold uppercase text-brand-muted mb-1 block">Descriere</label>
    <textarea 
      className={`${inputCls} min-h-[100px] resize-none`} 
      value={form.description} 
      onChange={(e) => setForm({ ...form, description: e.target.value })} 
    />
  </div>

      {error && <div className="text-[rgb(var(--error-text))] text-sm">{error}</div>}

      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onCancel} className="rounded-xl border border-brand-border px-5 py-2 text-sm font-semibold text-brand-muted hover:bg-brand-mid transition">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2 text-sm font-bold text-white hover:opacity-90 transition disabled:opacity-60">
          {saving && <Spinner size={14} />} Save changes
        </button>
      </div>
    </div>
  );
}