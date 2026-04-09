"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Importuri Redux
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginUser } from "@/store/thunks/authThunks";

export default function LoginPage() {
  // State pentru input-uri
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Extragem starea din Redux
  const { loading, error, user } = useAppSelector((state) => state.auth);

  // Dispatch pentru a trimite actiuni catre Redux
  const dispatch = useAppDispatch();

  // Redirect automat dupa login reusit
  useEffect(() => {
    if (user) {
      if (user.role == "admin")
        router.push("/dashboard/admin");

      else if (user.role == "teacher")
        router.push("/dashboard/teacher");

      else if (user.role == "student")
        router.push("/dashboard/student");

      else 
        router.push("/dashboard");
    }
  }, [user, router]);

  // Functia apelata la submit (simulam login-ul)
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  }

  return (
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
                className="bg-brand-bg/50 border border-brand-border text-brand-text rounded-xl px-4 py-2 placeholder-brand-muted focus:outline-none focus:border-brand-primary transition"                
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student@school.com"
              />
            </div>

            {/* INPUT PAROLA */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-brand-text">Password</label>
              <input
                type="password"
                className="bg-brand-bg/50 border border-brand-border text-brand-text rounded-xl px-4 py-2 placeholder-brand-muted focus:outline-none focus:border-brand-primary transition"                
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}

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
  );
}