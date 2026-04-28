import type { DeleteTarget } from "./types";

interface DeleteConfirmModalProps {
  deleteTarget: DeleteTarget;
  deleting: boolean;
  deleteErr: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({
  deleteTarget,
  deleting,
  deleteErr,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-brand-card border border-brand-primary/20 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-start gap-3 mb-4">
          <span className="material-symbols-rounded text-red-400 flex-shrink-0 mt-0.5" style={{ fontSize: "1.4rem" }}>warning</span>
          <div>
            <h2 className="text-brand-text font-semibold">Delete {deleteTarget.label}?</h2>
            <p className="text-brand-text/50 text-sm mt-1">This cannot be undone.</p>
          </div>
        </div>
        {deleteErr && <p className="text-red-400 text-sm mb-3">{deleteErr}</p>}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-brand-text/60 hover:text-brand-text border border-brand-primary/20 hover:bg-brand-text/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 transition-colors"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
