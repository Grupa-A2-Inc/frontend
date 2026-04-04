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
    const [confirmPassword, setConfirmPassword] = useState("");

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
            setError("Please fill in all required fields.");
            setLoading(false);
            return;
        }

        // VALIDARE EMAIL
        if (!adminEmail.includes("@")) {
            setError("Invalid email.");
            setLoading(false);
            return;
        }

        // VALIDARE CONFIRM PASSWORD
        if (adminPassword !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        // SIMULARE REQUEST
        setTimeout(() => {
            // Simulare erori business
            if (adminEmail.includes("test")) {
                setError("This email is already in use.");
                setLoading(false);
                return;
            }

            if (organizationName.toLowerCase() === "demo") {
                setError("This organization already exists.");
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
        <div className="min-h-screen flex items-center bg-brand-bg font-display transition-colors duration-300">

            {/* STANGA */}
            <div className="hidden lg:flex w-1/2 items-center justify-center p-10">
                <Image 
                    src="/reg-image.jpg"
                    alt="Register Illustration"
                    width={500}
                    height={500}
                    className="drop-shadow-2xl w-auto"
                />
            </div>

            {/* DREAPTA */}
            <div className="flex w-full lg:w-1/2 items-center justify-center p-10">
                <div className="bg-brand-card/80 backdrop-blur-xl shadow-2xl rounded-2xl p-10 w-full max-w-md border border-brand-border">

                    <h1 className="text-3xl font-bold text-brand-text mb-6">
                        Create a new organization
                    </h1>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                        {/* ADMIN */}
                        <div>
                            <h2 className="text-lg font-semibold text-brand-text mb-2">Administrator Details</h2>

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

                        {/* ORGANIZATIE */}
                        <div>
                            <h2 className="text-lg font-semibold text-brand-text mb-2">Organization Details</h2>

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

                        {/* ERORI */}
                        {error && (
                            <p className="text-red-500 text-sm font-medium">{error}</p>
                        )}

                        {/*SUCCES */}
                        {success && (
                            <p className="text-brand-accent text-sm font-medium">
                                Organization created successfully! Redirecting...
                            </p>
                        )}

                        {/* SUBMIT */}
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
                        <a href="/login" className="text-brand-primary font-medium hover:opacity-80">
                            Log in
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}