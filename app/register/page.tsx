"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";

const inputClass =
  "h-12 w-full px-4 rounded-xl border border-warm-border dark:border-cocoa-border bg-cream-card dark:bg-cocoa-card text-cocoa dark:text-on-dark font-body font-semibold text-[15px] placeholder:text-subtle outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all";

export default function RegisterPage() {
  const router = useRouter();

  const [adminFirstName, setAdminFirstName] = useState("");
  const [adminLastName, setAdminLastName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [organizationName, setOrganizationName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (!adminFirstName || !adminLastName || !adminEmail || !adminPassword || !organizationName || !country || !city || !organizationType) {
      setError("Te rugăm să completezi toate câmpurile obligatorii.");
      setLoading(false);
      return;
    }

    if (!adminEmail.includes("@")) {
      setError("Email invalid.");
      setLoading(false);
      return;
    }

    setTimeout(() => {
      if (adminEmail.includes("test")) {
        setError("Acest email este deja folosit.");
        setLoading(false);
        return;
      }
      if (organizationName.toLowerCase() === "demo") {
        setError("Această organizație există deja.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      localStorage.setItem("user", JSON.stringify({ role: "admin", adminFirstName, adminLastName, adminEmail, organizationName }));
      setLoading(false);
      router.push("/dashboard/admin");
    }, 1200);
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-cocoa">
      <Navbar />

      <div className="min-h-screen flex items-center justify-center px-6 pt-[68px]">
        <div className="w-full max-w-xl py-12">

          <span className="font-hand text-lg text-brand block mb-2">~ hai să începem ~</span>
          <h1 className="font-display font-black text-cocoa dark:text-on-dark text-[32px] leading-tight mb-1">
            Creează o organizație
          </h1>
          <p className="font-body font-semibold text-muted dark:text-muted-dark text-sm mb-8">
            Ai deja cont?{" "}
            <Link href="/login" className="text-brand hover:text-brand-dark font-bold no-underline transition-colors">
              Autentifică-te
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Date administrator */}
            <div className="flex flex-col gap-4">
              <h2 className="font-display font-extrabold text-base text-cocoa dark:text-on-dark">
                Date administrator
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-body text-sm font-bold text-cocoa dark:text-on-dark">Prenume *</label>
                  <input
                    type="text"
                    placeholder="Ion"
                    value={adminFirstName}
                    onChange={(e) => setAdminFirstName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-body text-sm font-bold text-cocoa dark:text-on-dark">Nume *</label>
                  <input
                    type="text"
                    placeholder="Popescu"
                    value={adminLastName}
                    onChange={(e) => setAdminLastName(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-body text-sm font-bold text-cocoa dark:text-on-dark">Email *</label>
                <input
                  type="email"
                  placeholder="admin@scoala.ro"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-body text-sm font-bold text-cocoa dark:text-on-dark">Parolă *</label>
                <input
                  type="password"
                  placeholder="Minim 8 caractere"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-warm-border dark:bg-cocoa-border"/>

            {/* Date organizatie */}
            <div className="flex flex-col gap-4">
              <h2 className="font-display font-extrabold text-base text-cocoa dark:text-on-dark">
                Date organizație
              </h2>

              <div className="flex flex-col gap-1.5">
                <label className="font-body text-sm font-bold text-cocoa dark:text-on-dark">Nume organizație *</label>
                <input
                  type="text"
                  placeholder="ex: Liceul Teoretic Nr. 1"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-body text-sm font-bold text-cocoa dark:text-on-dark">Țară *</label>
                  <input
                    type="text"
                    placeholder="România"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-body text-sm font-bold text-cocoa dark:text-on-dark">Oraș *</label>
                  <input
                    type="text"
                    placeholder="București"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-body text-sm font-bold text-cocoa dark:text-on-dark">Tip organizație *</label>
                <input
                  type="text"
                  placeholder="ex: Școală, Liceu, Universitate"
                  value={organizationType}
                  onChange={(e) => setOrganizationType(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-body text-sm font-bold text-cocoa dark:text-on-dark">
                  Adresă <span className="font-semibold text-subtle">(opțional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Str. Exemplu nr. 10"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-body text-sm font-bold text-cocoa dark:text-on-dark">
                  Telefon <span className="font-semibold text-subtle">(opțional)</span>
                </label>
                <input
                  type="text"
                  placeholder="+40 700 000 000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3">
                <p className="font-body text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-xl px-4 py-3">
                <p className="font-body text-sm font-semibold text-green-700 dark:text-green-400">
                  Organizația a fost creată cu succes! Redirecționăm...
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-12 rounded-xl bg-brand hover:bg-brand-dark text-on-dark font-body font-extrabold text-[15px] cursor-pointer shadow-[0_4px_16px_rgba(143,96,56,0.4)] hover:shadow-[0_6px_24px_rgba(143,96,56,0.5)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {loading ? "Se procesează..." : "Creează organizația →"}
            </button>
          </form>

          <p className="font-body text-xs font-semibold text-subtle text-center mt-6">
            Prin înregistrare ești de acord cu{" "}
            <a href="#" className="text-muted dark:text-muted-dark hover:text-brand no-underline transition-colors">Termenii</a>
            {" "}și{" "}
            <a href="#" className="text-muted dark:text-muted-dark hover:text-brand no-underline transition-colors">Politica de confidențialitate</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
