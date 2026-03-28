"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      if (!email || !password) {
        setError("Te rugăm să completezi toate câmpurile.");
        setSuccess("");
      } else {
        setError("");
        setSuccess("Autentificare reușită!");
      }
      setLoading(false);
    }, 1200);
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-cocoa">
      <Navbar />

      <div className="min-h-screen flex items-center justify-center px-6 pt-[68px]">
        <div className="w-full max-w-md py-12">

          <span className="font-hand text-lg text-brand block mb-2">~ bun venit înapoi ~</span>
          <h1 className="font-display font-black text-cocoa dark:text-on-dark text-[32px] leading-tight mb-1">
            Autentifică-te
          </h1>
          <p className="font-body font-semibold text-muted dark:text-muted-dark text-sm mb-8">
            Nu ai cont?{" "}
            <Link href="/register" className="text-brand hover:text-brand-dark font-bold no-underline transition-colors">
              Înregistrează-te gratuit
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            <div className="flex flex-col gap-1.5">
              <label className="font-body text-sm font-bold text-cocoa dark:text-on-dark">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex: profesor@scoala.ro"
                className="h-12 px-4 rounded-xl border border-warm-border dark:border-cocoa-border bg-cream-card dark:bg-cocoa-card text-cocoa dark:text-on-dark font-body font-semibold text-[15px] placeholder:text-subtle outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-body text-sm font-bold text-cocoa dark:text-on-dark">Parolă</label>
                <a href="#" className="font-body text-xs font-semibold text-brand hover:text-brand-dark no-underline transition-colors">
                  Ai uitat parola?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introduceți parola"
                className="h-12 px-4 rounded-xl border border-warm-border dark:border-cocoa-border bg-cream-card dark:bg-cocoa-card text-cocoa dark:text-on-dark font-body font-semibold text-[15px] placeholder:text-subtle outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3">
                <p className="font-body text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-xl px-4 py-3">
                <p className="font-body text-sm font-semibold text-green-700 dark:text-green-400">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-12 rounded-xl bg-brand hover:bg-brand-dark text-on-dark font-body font-extrabold text-[15px] cursor-pointer shadow-[0_4px_16px_rgba(143,96,56,0.4)] hover:shadow-[0_6px_24px_rgba(143,96,56,0.5)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {loading ? "Se încarcă..." : "Autentifică-te →"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-warm-border dark:bg-cocoa-border"/>
            <span className="font-body text-xs font-semibold text-subtle">sau</span>
            <div className="flex-1 h-px bg-warm-border dark:bg-cocoa-border"/>
          </div>

          <p className="font-body text-xs font-semibold text-subtle text-center">
            Prin autentificare ești de acord cu{" "}
            <a href="#" className="text-muted dark:text-muted-dark hover:text-brand no-underline transition-colors">Termenii</a>
            {" "}și{" "}
            <a href="#" className="text-muted dark:text-muted-dark hover:text-brand no-underline transition-colors">Politica de confidențialitate</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
