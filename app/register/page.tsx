"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://backend-for-render-ws6z.onrender.com";

type RegisterResponse = {
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

export default function RegisterPage() {
  const router = useRouter();

  const [adminFirstName, setAdminFirstName] = useState("");
  const [adminLastName, setAdminLastName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [organizationName, setOrganizationName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (
      !adminFirstName.trim() ||
      !adminLastName.trim() ||
      !adminEmail.trim() ||
      !adminPassword.trim() ||
      !confirmPassword.trim() ||
      !organizationName.trim() ||
      !country.trim() ||
      !city.trim() ||
      !organizationType.trim()
    ) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (!adminEmail.includes("@")) {
      setError("Invalid email.");
      setLoading(false);
      return;
    }

    if (adminPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/register`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    firstName: adminFirstName.trim(),
    lastName: adminLastName.trim(),
    email: adminEmail.trim(),
    password: adminPassword,
    confirmPassword,
    organizationName: organizationName.trim(),
    country: country.trim(),
    city: city.trim(),
    organizationType: organizationType.trim(),
    address: address.trim(),
    phoneNumber: phoneNumber.trim(),
  }),
});


const text = await response.text();
const data: RegisterResponse | null = text ? JSON.parse(text) : null;


      if (!response.ok) {
        throw new Error(data?.message || "Failed to create organization.");
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

      setSuccess(true);

      setTimeout(() => {
        router.push("/dashboard/admin");
      }, 800);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong during registration."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center bg-brand-bg font-display transition-colors duration-300">
      <div className="hidden lg:flex w-1/2 items-center justify-center p-10">
        <Image
          src="/reg-image.jpg"
          alt="Register Illustration"
          width={500}
          height={500}
          className="drop-shadow-2xl w-auto"
        />
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-10">
        <div className="bg-brand-card/80 backdrop-blur-xl shadow-2xl rounded-2xl p-10 w-full max-w-md border border-brand-border">
          <h1 className="text-3xl font-bold text-brand-text mb-6">
            Create a new organization
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-semibold text-brand-text mb-2">
                Administrator Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Admin First Name"
                  className="bg-brand-bg/50 text-brand-text border border-brand-border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-brand-primary outline-none transition-colors"
                  value={adminFirstName}
                  onChange={(e) => setAdminFirstName(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Admin Last Name"
                  className="bg-brand-bg/50 text-brand-text border border-brand-border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-brand-primary outline-none transition-colors"
                  value={adminLastName}
                  onChange={(e) => setAdminLastName(e.target.value)}
                />
              </div>

              <input
                type="email"
                placeholder="Admin Email"
                className="mt-4 bg-brand-bg/50 text-brand-text border border-brand-border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-brand-primary outline-none w-full transition-colors"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Admin Password"
                className="mt-4 bg-brand-bg/50 text-brand-text border border-brand-border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-brand-primary outline-none w-full transition-colors"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />

              <input
                type="password"
                placeholder="Confirm Password"
                className="mt-4 bg-brand-bg/50 text-brand-text border border-brand-border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-brand-primary outline-none w-full transition-colors"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-brand-text mb-2">
                Organization Details
              </h2>

              <input
                type="text"
                placeholder="Organization Name"
                className="bg-brand-bg/50 text-brand-text border border-brand-border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-brand-primary outline-none w-full transition-colors"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <input
                  type="text"
                  placeholder="Country"
                  className="bg-brand-bg/50 text-brand-text border border-brand-border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-brand-primary outline-none transition-colors"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="City"
                  className="bg-brand-bg/50 text-brand-text border border-brand-border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-brand-primary outline-none transition-colors"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <input
                type="text"
                placeholder="Organization Type (e.g. School, High School)"
                className="mt-4 bg-brand-bg/50 text-brand-text border border-brand-border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-brand-primary outline-none w-full transition-colors"
                value={organizationType}
                onChange={(e) => setOrganizationType(e.target.value)}
              />

              <input
                type="text"
                placeholder="Address (optional)"
                className="mt-4 bg-brand-bg/50 text-brand-text border border-brand-border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-brand-primary outline-none w-full transition-colors"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <input
                type="text"
                placeholder="Phone Number (optional)"
                className="mt-4 bg-brand-bg/50 text-brand-text border border-brand-border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-brand-primary outline-none w-full transition-colors"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}

            {success && (
              <p className="text-brand-accent text-sm font-medium">
                Organization created successfully! Redirecting...
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white py-3 rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? "Processing..." : "Create organization"}
            </button>
          </form>

          <p className="text-sm text-brand-muted mt-4">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-brand-primary font-medium hover:opacity-80"
            >
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}