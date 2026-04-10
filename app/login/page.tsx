"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://backend-for-render-ws6z.onrender.com";

type LoginResponse = {
  message?: string;
  accessToken: string;
  user: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    status?: string;
    organizationId?: string | number;
    organizationName?: string;
    organizationType?: string;
    country?: string;
    city?: string;
    organizationPhoneNumber?: string;
    organizationAddress?: string;
  };
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const text = await response.text();
      const data: LoginResponse | null = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(
          data?.message || "Login failed. Please check your credentials."
        );
      }

      const normalizedUser = {
        ...data?.user,
        role: String(data?.user?.role || "").toLowerCase(),
        organizationId: data?.user?.organizationId
          ? String(data.user.organizationId)
          : undefined,
      };

      if (!data?.accessToken) {
        throw new Error("Access token was not returned by the server.");
      }

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(normalizedUser));

      setSuccess("Login successful!");

      const normalizedRole = normalizedUser.role;

      setTimeout(() => {
        if (normalizedRole === "admin") {
          router.push("/dashboard/admin");
        } else if (normalizedRole === "teacher") {
          router.push("/dashboard/teacher");
        } else if (normalizedRole === "student") {
          router.push("/dashboard/student");
        } else {
          router.push("/");
        }
      }, 800);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong during login."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-brand-bg font-display transition-colors">
      <div className="hidden lg:flex w-1/2 items-center justify-center p-10">
        <Image
          src="/log-image.jpg"
          alt="Edu Illustration"
          width={500}
          height={500}
          className="drop-shadow-2xl"
        />
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-10">
        <div className="bg-brand-card/80 backdrop-blur-xl shadow-2xl rounded-2xl p-10 w-full max-w-md border border-brand-border">
          <h1 className="text-3xl font-bold text-brand-text mb-2">
            Welcome back!
          </h1>
          <p className="text-brand-muted mb-6">
            Log in to continue your learning journey
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-brand-text">
                Email
              </label>
              <input
                type="email"
                value={email}
                className="bg-brand-bg/50 border border-brand-border text-brand-text rounded-xl px-4 py-2 placeholder-brand-muted focus:outline-none focus:border-brand-primary transition"                
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student@school.com"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-brand-text">
                Password
              </label>
              <input
                type="password"
                value={password}
                className="bg-brand-bg/50 border border-brand-border text-brand-text rounded-xl px-4 py-2 placeholder-brand-muted focus:outline-none focus:border-brand-primary transition"                
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}

            {success && (
              <p className="text-brand-accent text-sm font-medium">{success}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-primary hover:bg-brand-primary/90 transition rounded-xl font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Loading..." : "Log in"}
            </button>
          </form>

          <p className="text-sm text-brand-muted text-center mt-4">
            Don&apos;t have an account?
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