"use client";
import Link from "next/link";
import { useState } from "react";
import { useTheme } from "../ThemeProvider";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed w-full z-50 bg-brand-bg/80 backdrop-blur-md border-b border-brand-border transition-colors duration-300">
      <div className="flex items-center justify-between h-20 px-6 md:px-16 max-w-7xl mx-auto">
        
        {/* Logo */}
        <Link href="/" className="text-2xl font-black tracking-tight flex gap-1">
          <span className="text-brand-primary">Testify</span>
          <span className="text-brand-accent">AI</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-brand-mid transition-colors text-brand-text"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          
          <Link href="/login" className="text-brand-text font-bold hover:text-brand-primary transition-colors">
            Log in
          </Link>
          <Link href="/register" className="px-6 py-2.5 rounded-xl bg-brand-primary text-white font-bold hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(91,106,208,0.3)]">
            Get Started
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden flex flex-col justify-center gap-1.5 w-8 h-8 z-50"
          onClick={() => setOpen(!open)}
        >
          <span className={`block w-6 h-0.5 bg-brand-text transition-all ${open ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-brand-text transition-all ${open ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-brand-text transition-all ${open ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-20 left-0 w-full bg-brand-bg border-b border-brand-border transition-all duration-300 overflow-hidden ${open ? "max-h-64" : "max-h-0"}`}>
        <div className="flex flex-col gap-4 p-6">
          <button onClick={toggleTheme} className="flex items-center gap-3 text-brand-text font-bold">
            {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
          <Link href="/login" className="text-brand-text font-bold" onClick={() => setOpen(false)}>Log in</Link>
          <Link href="/register" className="text-brand-primary font-bold" onClick={() => setOpen(false)}>Get Started</Link>
        </div>
      </div>
    </nav>
  );
}