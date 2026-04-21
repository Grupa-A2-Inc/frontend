"use client";
import { Student } from "@/lib/classes/types";
import Spinner from "@/components/class-ui/Spinner";

type Props = { student: Student; removing: boolean; onConfirm: () => void; onCancel: () => void; };

export default function ConfirmRemoveModal({ student, removing, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl border border-brand-border bg-brand-card p-6 shadow-2xl">
        <h3 className="text-base font-bold text-brand-text">Remove student?</h3>
        <p className="mt-2 text-sm text-brand-muted">
          <span className="font-semibold text-brand-text">{student.firstName} {student.lastName}</span> will be removed from this class.
        </p>
        <div className="mt-6 flex gap-3">
          <button onClick={onCancel} disabled={removing} className="flex-1 rounded-xl border border-brand-border py-2.5 text-sm font-semibold hover:bg-brand-mid transition">Cancel</button>
          <button onClick={onConfirm} disabled={removing} className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white bg-[rgb(var(--error-text))] transition disabled:opacity-60">
            {removing ? <Spinner size={14} /> : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}