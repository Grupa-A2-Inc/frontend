"use client"

import { useState } from "react";
import Image from "next/image";

export default function LoginPage() {
    // State pentru input-uri
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
            if (email === "" || password ==="") {
                setError("Te rugăm să completezi toate câmpurile.");
                setSuccess(""); // curatam succesul
            } else {
                setError(""); // curatam eroarea
                setSuccess("Autentificare reușită!");
            }
            setLoading(false);
        }, 1200);
    }

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-background to-secondary/10">
            {/* -------------------- */}
            { /* SECIUNEA STANGA CU ILUSTRATIE */}
            { /* -------------------- */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary via-primary-dark to-secondary items-center justify-center p-10">
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
            <div className="flex w-full lg:w-1/2 items-center justify-center p-10">
                <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-10 w-full max-w-md border border-white/40">

                    {/* TITLU */}
                    <h1 className="text-3xl font-bold text-text mb-6 font-[Fredoka]">
                        Bine ai revenit!
                    </h1>

                    {/* FORMULAR */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                        {/* INPUT EMAIL */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-text">Email</label> 
                            <input  
                                type="email"
                                className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ex: elev@school.com"
                            />
                        </div>

                        {/* INPUT PAROLA */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-text">Parola</label>
                            <input
                                type="password"
                                className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Introduceți parola"
                            />
                        </div>

                        {/* MESAJ DE EROARE */}
                        {error && (
                            <p className="text-red-500 text-sm font-medium">{error}</p>
                        )}

                        {/*MESAJ DE SUCCES */}
                        {success && (
                            <p className="text-green-600 text-sm font-medium">{success}</p>
                        )}

                        {/* BUTON LOGIN */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary hover:bg-primary-dark text-white py-3 rounded-2xl shadow-lg transition-all disabled:opacity-50"
                        >
                            {loading ? "Se încarcă..." : "Autentifică-te"}
                        </button>
                    </form>

                    {/* LINK CATRE REGISTER */}
                    <p className="text-sm text-gray-600 mt-4">
                        Nu ai cont?{" "}
                        <a href="/register" className="text-primary font-medium hover:underline">
                            Creează cont
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}