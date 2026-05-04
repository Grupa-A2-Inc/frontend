"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
// Redux Toolkit hooks
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import Link from "next/link";
import { login, clearError } from "@/store/slices/authSlice";

function formatAuthError(msg: string): string {
  return msg.replace(/after (\d{1,2}):(\d{2})/i, (_, h, m) => {
    const hour = parseInt(h, 10);
    const suffix = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `at ${hour12}:${m} ${suffix}`;
  });
}

export default function LoginPage() {
  // State pentru input-uri
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Extragem state-ul din Redux
  const { loading, error } = useAppSelector(
    (state) => state.auth 
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // prevenim refresh-ul paginii

    dispatch(clearError());

    const result = await dispatch(login({ email, password }));

    if (!login.fulfilled.match(result)) 
      return;
    const role = result.payload.user.role;

    if (role === "ORGANIZATION_ADMIN") 
      router.push("/dashboard/admin");

    if (role === "TEACHER") 
      router.push("/dashboard/teacher");

    if (role === "STUDENT") 
      router.push("/dashboard/student");
  }

  return (
    <>
      <div className="min-h-screen flex bg-brand-bg font-display transition-colors">      
        {/* -------------------- */}
        {/* SECIUNEA STANGA CU ILUSTRATIE */}
        {/* -------------------- */}
        <div className="hidden lg:flex w-1/2 items-center justify-center p-10">
          <Image
            src="/log-image.jpg"
            alt="Edu Illustration"
            width={500}
            height={500}
            className="drop-shadow-2xl"
          />
        </div>

        {/* -------------------- */}
        {/* SECTIUNEA DREAPTA CU FORMULARUL */}
        {/* -------------------- */}
        <div className="flex w-full lg:w-1/2 items-center justify-center p-10">
          <div className="bg-brand-card/80 backdrop-blur-xl shadow-2xl rounded-2xl p-10 w-full max-w-md border border-brand-border">          
          {/* TITLU */}
            <h1 className="text-3xl font-bold text-brand-text mb-2">            
              Welcome back!
            </h1>
            <p className="text-brand-muted mb-6">            
              Log in to continue your learning journey
            </p>

            {/* FORMULAR */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* INPUT EMAIL */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-brand-text">Email</label>
                <input
                  type="email"
                  value={email}
                  className="bg-brand-bg/50 border border-brand-border text-brand-text rounded-xl px-4 py-2 placeholder-brand-muted focus:outline-none focus:border-brand-primary transition"                
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@school.com"
                />
              </div>

              {/* INPUT PAROLA */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-brand-text">Password</label>
                  <Link href="/forgot-password" className="text-xs text-brand-primary hover:opacity-80 transition">
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  value={password}
                  className="bg-brand-bg/50 border border-brand-border text-brand-text rounded-xl px-4 py-2 placeholder-brand-muted focus:outline-none focus:border-brand-primary transition"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>

              {/* MESAJ DE EROARE */}
              {error && <p className="text-red-500 text-sm font-medium">{formatAuthError(error)}</p>}

              {/* BUTON LOGIN */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-primary hover:bg-brand-primary/90 transition rounded-xl font-semibold text-white disabled:opacity-50"
              >              
                {loading ? "Loading..." : "Log in"}
              </button>
            </form>

            {/* LINK CATRE REGISTER */}
            <p className="text-sm text-brand-muted text-center mt-4">            
              Don't have an account?
              <a
                href="/register"
                className="text-brand-primary hover:opacity-80 ml-1"
              >              
                Create account
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}