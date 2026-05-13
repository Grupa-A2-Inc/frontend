"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getAuthMutationErrorMessage,
  useRequestPasswordResetMutation,
} from "@/store/api/authApi";

export default function ForgotPasswordPage() {
  const [requestPasswordReset, { isLoading }] = useRequestPasswordResetMutation();
  const [email, setEmail]   = useState("");
  const [error, setError]   = useState("");
  const [sent, setSent]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) { setError("Please enter a valid email address."); return; }
    setError("");
    try {
      await requestPasswordReset({ email: email.trim() }).unwrap();
      setSent(true);
    } catch (mutationError) {
      setError(getAuthMutationErrorMessage(mutationError));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg p-6">
      <div className="bg-brand-card border border-brand-primary/20 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex flex-col items-center pt-8 pb-4 px-8 gap-3">
          <Image src="/logo_192x192.png" alt="logo" width={40} height={40} />
          <div className="text-center">
            <h1 className="text-brand-text text-xl font-bold">Forgot password?</h1>
            <p className="text-brand-muted text-sm mt-1">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>
        </div>

        {sent ? (
          <div className="px-8 pb-8 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-primary/15 flex items-center justify-center">
              <span className="material-symbols-rounded text-brand-primary" style={{ fontSize: "2rem" }}>mark_email_unread</span>
            </div>
            <div className="text-center space-y-1">
              <p className="text-brand-text font-semibold">Check your email</p>
              <p className="text-brand-muted text-sm">
                If an account with that address exists, a reset link has been sent. Check your spam folder if it doesn&apos;t arrive.
              </p>
            </div>
            <Link href="/login" className="w-full py-2.5 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-semibold transition-colors text-center">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-8 pb-8 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-brand-text/60">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. john@school.com"
                className="bg-brand-mid border border-brand-primary/20 rounded-lg px-3 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors"
              />
            </div>

            {error && <p className="text-red-400 text-xs font-medium">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-semibold transition-colors disabled:opacity-50 mt-1"
            >
              {isLoading ? "Sending…" : "Send Reset Link"}
            </button>

            <Link href="/login" className="text-xs text-brand-muted hover:text-brand-text text-center transition-colors">
              Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
