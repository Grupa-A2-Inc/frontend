"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  // State pentru input-uri
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State pentru UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Functia apelata la submit (simulam login-ul)
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // prevenim refresh-ul paginii
    setLoading(true);
    setError("");

    // Simulare login (fara backend)
    setTimeout(() => {
        if (email === "" || password === "") {
            setError("Please fill in all fields.");
            setSuccess("");
            
        } else if (email === "admin@test.com" && password === "admin123") {
            localStorage.setItem(
            "user",
            JSON.stringify({ role: "admin", name: "Admin User", email }),
            );
            
            setSuccess("Login successful!");
            setTimeout(() => router.push("/dashboard/admin"), 1000);

        } else if (email === "teacher@test.com" && password === "teacher123") {
            localStorage.setItem(
            "user",
            JSON.stringify({ role: "teacher", name: "Teacher User", email }),
            );

            setSuccess("Login successful!");
            setTimeout(() => router.push("/dashboard/teacher"), 1000);
        
        } else if (email === "student@test.com" && password === "student123") {
            localStorage.setItem(
            "user",
            JSON.stringify({ role: "student", name: "Student User", email }),
            );
            
            setSuccess("Login successful!");
            setTimeout(() => router.push("/dashboard/student"), 1000);
        
        } else {
            setError("Invalid email or password.");
            setSuccess("");
        }
      setLoading(false);
    }, 1200);
  }

  return (
    <div className="min-h-screen flex bg-brand-bg font-display transition-colors duration-300">
      {/* -------------------- */}
      {/* SECIUNEA STANGA CU ILUSTRATIE */}
      {/* -------------------- */}
      <div className="hidden lg:flex w-1/2 items-center justify-center p-10">
        <Image
          src="/login-illustration.jpg"
          alt="Edu Illustration"
          width={500}
          height={500}
          className="drop-shadow-2xl"
        />
      </div>

      {/* -------------------- */}
      {/* SECTIUNEA DREAPTA CU FORMULARUL */}
      {/* -------------------- */}
      <div className="flex w-full bg-brand-mid lg:w-1/2 items-center justify-center p-10">
        <div className="bg-brand-card/80 backdrop-blur-xl shadow-2xl rounded-3xl p-10 w-full max-w-md border border-brand-border/50">
          {/* TITLU */}
          <h1 className="text-3xl font-bold text-brand-text mb-6">
            Welcome back!
          </h1>

          {/* FORMULAR */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* INPUT EMAIL */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-brand-text">Email</label>
              <input
                type="email"
                className="bg-brand-bg/50 border border-brand-border text-brand-text rounded-xl px-4 py-2 focus:ring-2 focus:ring-brand-primary outline-none transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student@school.com"
              />
            </div>

            {/* INPUT PAROLA */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-brand-text">Password</label>
              <input
                type="password"
                className="bg-brand-bg/50 border border-brand-border text-brand-text rounded-xl px-4 py-2 focus:ring-2 focus:ring-brand-primary outline-none transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            {/* MESAJ DE EROARE */}
            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}

            {/*MESAJ DE SUCCES */}
            {success && (
              <p className="text-brand-accent text-sm font-medium">{success}</p>
            )}

            {/* BUTON LOGIN */}
            <button
              type="submit"
              disabled={loading}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white py-3 rounded-2xl shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? "Loading..." : "Log in"}
            </button>
          </form>

          {/* LINK CATRE REGISTER */}
          <p className="text-sm text-brand-muted mt-4">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-brand-primary font-medium hover:underline"
            >
              Create account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}