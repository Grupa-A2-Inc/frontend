"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAppDispatch } from "@/store/hooks";
import { confirmPasswordReset } from "@/store/slices/authSlice";

function ResetPasswordForm() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const dispatch      = useAppDispatch();
  const token         = searchParams.get("token") ?? "";

  const [password, setPass]           = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [done, setDone]               = useState(false);

  useEffect(() => {
    if (!token) setError("No reset token found. Please use the link from your email.");
  }, [token]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password.length < 8)          { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword)  { setError("Passwords do not match."); return; }
    setError("");
    setLoading(true);
    const result = await dispatch(confirmPasswordReset({ token, newPassword: password, confirmPassword }));
    setLoading(false);
    if (confirmPasswordReset.fulfilled.match(result)) {
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } else {
      setError(result.payload as string);
    }
  }

  return (
    <div className="bg-brand-card border border-brand-primary/20 rounded-2xl w-full max-w-sm shadow-2xl">
      <div className="flex flex-col items-center pt-8 pb-4 px-8 gap-3">
        <Image src="/my_logo.png" alt="logo" width={40} height={40} />
        <div className="text-center">
          <h1 className="text-brand-text text-xl font-bold">Reset password</h1>
          <p className="text-brand-muted text-sm mt-1">Enter your new password below.</p>
        </div>
      </div>

      {done ? (
        <div className="px-8 pb-8 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
            <span className="material-symbols-rounded text-emerald-400" style={{ fontSize: "2rem" }}>check_circle</span>
          </div>
          <div className="text-center">
            <p className="text-brand-text font-semibold">Password updated!</p>
            <p className="text-brand-muted text-sm">Redirecting to login…</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="px-8 pb-8 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-brand-text/60">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Minimum 8 characters"
              disabled={!token}
              className="bg-brand-mid border border-brand-primary/20 rounded-lg px-3 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors disabled:opacity-50"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-brand-text/60">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your password"
              disabled={!token}
              className="bg-brand-mid border border-brand-primary/20 rounded-lg px-3 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors disabled:opacity-50"
            />
          </div>

          {error && <p className="text-red-400 text-xs font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full py-2.5 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-semibold transition-colors disabled:opacity-50 mt-1"
          >
            {loading ? "Saving…" : "Reset Password"}
          </button>

          <Link href="/login" className="text-xs text-brand-muted hover:text-brand-text text-center transition-colors">
            Back to Login
          </Link>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg p-6">
      <Suspense fallback={<div className="text-brand-muted text-sm">Loading…</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
