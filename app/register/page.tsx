"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();

    // ----------------------------------------
    // STATE ADMIN
    // ----------------------------------------
    const [adminFirstName, setAdminFirstName] = useState("");
    const [adminLastName, setAdminLastName] = useState("");
    const [adminEmail, setAdminEmail] = useState("");
    const [adminPassword, setAdminPassword] = useState("");

    // ----------------------------------------
    // STATE ORGANIZATIE
    // ----------------------------------------
    const [organizationName, setOrganizationName] = useState("");
    const [country, setCountry] = useState("");
    const [city, setCity] = useState("");
    const [organizationType, setOrganizationType] = useState("");
    const [address, setAddress] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    // ----------------------------------------
    // UI STATE
    // ----------------------------------------
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // ----------------------------------------
    // HANDLE SUBMIT (FAKE BACKEND)
    // ----------------------------------------
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        // VALIDARE CLIENT-SIDE
        if (
            !adminFirstName ||
            !adminLastName ||
            !adminEmail ||
            !adminPassword ||
            !organizationName ||
            !country ||
            !city ||
            !organizationType
        ) {
            setError("Te rugăm să completezi toate câmpurile obligatorii.");
            setLoading(false);
            return;
        }

        // VALIDARE EMAIL
        if (!adminEmail.includes("@")) {
            setError("Email invalid.");
            setLoading(false);
            return;
        }

        // SIMULARE REQUEST
        setTimeout(() => {
            // Simulare erori business
            if (adminEmail.includes("test")) {
                setError("Acest email este deja folosit");
                setLoading(false);
                return;
            }

            if (organizationName.toLowerCase() === "demo") {
                setError("Această organizație există deja.");
                setLoading(false);
                return;
            }

            // SUCCES
            setSuccess(true);

            // Salvam user-ul in localStorage (fake)
            localStorage.setItem(
                "user",
                JSON.stringify({
                    role: "admin",
                    adminFirstName,
                    adminLastName,
                    adminEmail,
                    organizationName,
                })
            );

            setLoading(false);

            // Redirect catre dashboard admin
            router.push("/dashboard/admin");
        }, 1200);
    }

    return (
        <div className="min-h-screen flex bg-brand-bg font-display transition-colors duration-300">

            {/* STANGA */}
            <div className="hidden lg:flex w-1/2 items-center justify-center p-10">
                <Image 
                    src="/regist.jpg"
                    alt="Register Illustration"
                    width={500}
                    height={500}
                    className="drop-shadow-2xl w-auto"
                />
            </div>

            {/* DREAPTA */}
            <div className="flex w-full bg-brand-mid lg:w-1/2 items-center justify-center p-10">
                <div className="bg-brand-card/80 backdrop-blur-xl shadow-2xl rounded-3xl p-10 w-full max-w-xl border border-brand-border/50">

                    <h1 className="text-3xl font-bold text-brand-text mb-6">
                        Creează o organizație nouă
                    </h1>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                        {/* ADMIN */}
                        <div>
                            <h2 className="text-lg font-semibold text-brand-text mb-2">Date Administrator</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input 
                                    type="text"
                                    placeholder="Prenume Admin"
                                    className="bg-brand-bg/50 text-brand-text border border-brand-border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-brand-primary outline-none transition-colors"
                                    value={adminFirstName}
                                    onChange={(e) => setAdminFirstName(e.target.value)}
                                />

                                <input 
                                    type="text"
                                    placeholder="Nume Admin"
                                    className="bg-brand-bg/50 text-brand-text border border-brand-border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-brand-primary outline-none transition-colors"
                                    value={adminLastName}
                                    onChange={(e) => setAdminLastName(e.target.value)}
                                />
                            </div>

                            <input 
                                type="email"
                                placeholder="Email Admin"
                                className="mt-4 bg-brand-bg/50 text-brand-text border border-brand-border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-brand-primary outline-none w-full transition-colors"
                                value={adminEmail}
                                onChange={(e) => setAdminEmail(e.target.value)}
                            />

                            <input 
                                type="password"
                                placeholder="Parolă Admin"
                                className="mt-4 bg-brand-bg/50 text-brand-text border border-brand-border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-brand-primary outline-none w-full transition-colors"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                            />
                        </div>

                        {/* ORGANIZATIE */}
                        <div>
                            <h2 className="text-lg font-semibold text-brand-text mb-2">Date Organizatie</h2>

                            <input 
                                type="text"
                                placeholder="Nume Organizație"
                                className="bg-brand-bg/50 text-brand-text border border-brand-border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-brand-primary outline-none w-full transition-colors"
                                value={organizationName}
                                onChange={(e) => setOrganizationName(e.target.value)}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <input 
                                    type="text"
                                    placeholder="Țara"
                                    className="bg-brand-bg/50 text-brand-text border border-brand-border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-brand-primary outline-none transition-colors"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                />

                                <input 
                                    type="text"
                                    placeholder="Oraș"
                                    className="bg-brand-bg/50 text-brand-text border border-brand-border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-brand-primary outline-none transition-colors"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                />
                            </div>

                            <input 
                                type="text"
                                placeholder="Tip Organizație (ex: Școală, Liceu)"
                                className="mt-4 bg-brand-bg/50 text-brand-text border border-brand-border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-brand-primary outline-none w-full transition-colors"
                                value={organizationType}
                                onChange={(e) => setOrganizationType(e.target.value)}
                            />

                            <input 
                                type="text"
                                placeholder="Adresă (opțional)"
                                className="mt-4 bg-brand-bg/50 text-brand-text border border-brand-border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-brand-primary outline-none w-full transition-colors"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />

                            <input  
                                type="text"
                                placeholder="Număr de telefon (opțional)"
                                className="mt-4 bg-brand-bg/50 text-brand-text border border-brand-border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-brand-primary outline-none w-full transition-colors"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </div>

                        {/* ERORI */}
                        {error && (
                            <p className="text-red-500 text-sm font-medium">{error}</p>
                        )}

                        {/*SUCCES */}
                        {success && (
                            <p className="text-brand-accent text-sm font-medium">
                                Organizația a fost creată cu succes! Redirecționăm ...
                            </p>
                        )}

                        {/* SUBMIT */}
                        <button 
                            type="submit"
                            disabled={loading}
                            className="bg-brand-primary hover:bg-brand-primary/90 text-white py-3 rounded-2xl shadow-lg transition-all disabled:opacity-50"
                        >
                            {loading ? "Se procesează ..." : "Creează organizația"}
                        </button>
                    </form>

                    <p className="text-sm text-brand-muted mt-4">
                        Ai deja cont?{" "}
                        <a href="/login" className="text-brand-primary font-medium hover:underline">
                            Autentifică-te 
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}