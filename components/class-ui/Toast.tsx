"use client";
import { useEffect } from "react";

type Props = { message: string; type: "success" | "error"; onClose: () => void };

export default function Toast({ message, type, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const isSuccess = type === "success";

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-2xl border text-sm font-semibold transition-all animate-float ${
      isSuccess 
        ? "bg-[rgb(var(--success-bg))] border-[rgb(var(--success-border))] text-[rgb(var(--success-text))]"
        : "bg-[rgb(var(--error-bg))] border-[rgb(var(--error-border))] text-[rgb(var(--error-text))]"
    }`}>
      {isSuccess ? "✅" : "❌"}
      {message}
      <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100 transition-opacity">✕</button>
    </div>
  );
}