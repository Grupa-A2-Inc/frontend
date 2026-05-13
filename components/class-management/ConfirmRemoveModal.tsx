"use client";
import type { ClassroomMember as ClassMember } from "@/types/domain/classrooms";
import Spinner from "@/components/class-ui/Spinner";

type Props = { member: ClassMember; removing: boolean; onConfirm: () => void; onCancel: () => void; };

export default function ConfirmRemoveModal({ member, removing, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-black/40 backdrop-blur-sm"><div className="min-h-full flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl border border-brand-border bg-brand-card p-6 shadow-2xl">
        <h3 className="text-base font-bold text-brand-text">Remove member?</h3>
        <p className="mt-2 text-sm text-brand-muted">
          <span className="font-semibold text-brand-text">{member.email}</span> will be removed from this class.
        </p>
        <div className="mt-6 flex gap-3">
          <button onClick={onCancel} disabled={removing} className="flex-1 rounded-xl border border-brand-border py-2.5 text-sm font-semibold hover:bg-brand-mid transition">Cancel</button>
          <button onClick={onConfirm} disabled={removing} className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white bg-red-500 transition disabled:opacity-60">
            {removing ? <Spinner size={14} /> : "Remove"}
          </button>
        </div>
      </div>
    </div></div>
  );
}
