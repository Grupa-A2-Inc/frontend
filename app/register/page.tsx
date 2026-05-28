"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { register, clearError } from "@/store/slices/authSlice";

export default function RegisterPage() {
    const router = useRouter();

    const dispatch = useAppDispatch();

    // Extragem loading si error din Redux
    const { loading, error } = useAppSelector((state) => state.auth);

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
    // Erori de validare client-side
    const [validationError, setValidationError] = useState("");

    // ----------------------------------------
    // HANDLE SUBMIT 
    // ----------------------------------------
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        dispatch(clearError());
        setValidationError("");

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
            setValidationError("Please fill in all required fields.");
            return;
        }

        // VALIDARE EMAIL
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(adminEmail.trim())) {
            setValidationError("Please enter a valid email address.");
            return;
        }

        // VALIDARE CONFIRM PASSWORD
        if (adminPassword !== confirmPassword) {
            setValidationError("Passwords do not match.");
            return;
        }

        // Trimitem datele catre Redux thunk
        const result = await dispatch(register({
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
        }));

        // Daca register-ul a esuat, oprim
        if (!register.fulfilled.match(result)) {
            return;
        }

        router.push("/dashboard/admin/settings");
    }

    return (
        <>
            <div className="min-h-screen flex items-center bg-brand-bg font-display transition-colors duration-300">

                {/* STANGA */}
                <div className="hidden lg:flex w-1/2 items-center justify-center p-10">
                    <Image 
                        src="/login.svg"
                        alt="Register Illustration"
                        width={500}
                        height={500}
                        className="drop-shadow-2xl w-auto"
                    />
                </div>

                {/* DREAPTA */}
                <div className="flex w-full lg:w-1/2 items-center justify-center p-10">
                    <div className="bg-brand-card/80 backdrop-blur-xl shadow-2xl rounded-2xl p-10 w-full max-w-2xl border border-brand-border">

                        <h1 className="text-3xl font-bold text-brand-text mb-4">
                            Create a new organization
                        </h1>

                        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-3 mb-4 flex gap-3">
                            <span className="text-amber-400 flex-shrink-0 text-lg leading-snug">⚠</span>
                            <div className="text-xs text-amber-300/90 leading-relaxed space-y-1">
                                <p className="font-semibold text-amber-300">This page is for organization administrators only.</p>
                                <p>Registering here creates a new organization and grants you admin access. Teacher and student accounts cannot be created from this page — they must be added by the organization admin from within the dashboard.</p>
                                <p>After creating your account, you can choose a subscription plan in Settings.</p>
                            </div>
                        </div>

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
                                    placeholder="Phone Number"
                                    className="mt-4 bg-brand-bg/50 text-brand-text border border-brand-border rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-brand-primary outline-none w-full transition-colors"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>

                            {/* ERORI VALIDARE CLIENT-SIDE */}
                            {validationError && (
                                <p className="text-red-500 text-sm font-medium">{validationError}</p>
                            )}
                            
                            {/* ERORI BCKEND */}
                            {error && (
                                <p className="text-red-500 text-sm font-medium">{error}</p>
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
        </>
    );
}
