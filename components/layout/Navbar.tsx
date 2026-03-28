"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full bg-[#0B0F19]">
      <div className="flex items-center justify-between h-20 md:h-32 px-6 md:px-[100px]">
        
        {}
        <h1 className="text-2xl md:text-[28px] font-extrabold tracking-tight">
          <span className="text-[#4c57a9]">Testify</span>
          <span className="text-[#a57ef1]">AI</span>
        </h1>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/login">
            <button className="h-12 w-44 rounded-2xl bg-[#5B6AD0] text-white font-bold text-lg tracking-wide shadow-[0_4px_20px_rgba(91,106,208,0.5)] hover:shadow-[0_4px_28px_rgba(91,106,208,0.7)] hover:brightness-110 transition-all duration-200 cursor-pointer">
              Log in
            </button>
          </Link>
          <Link href="/register">
            <button className="h-12 w-44 rounded-2xl bg-[#58A06C] text-white font-bold text-lg tracking-wide shadow-[0_4px_20px_rgba(88,160,108,0.5)] hover:shadow-[0_4px_28px_rgba(88,160,108,0.7)] hover:brightness-110 transition-all duration-200 cursor-pointer">
              Get Started
            </button>
          </Link>
        </div>

    
        <button
          className="md:hidden flex flex-col justify-center items-center gap-1.5 w-10 h-10 cursor-pointer"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${open ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${open ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${open ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      <div className={`md:hidden overflow-hidden transition-all duration-300 ${open ? "max-h-48" : "max-h-0"}`}>
        <div className="flex flex-col items-center gap-4 pb-6 px-6">
          <Link href="/login" className="w-full" onClick={() => setOpen(false)}>
            <button className="w-full h-12 rounded-2xl bg-[#5B6AD0] text-white font-bold text-lg tracking-wide shadow-[0_4px_20px_rgba(91,106,208,0.5)] hover:brightness-110 transition-all duration-200 cursor-pointer">
              Log in
            </button>
          </Link>
          <Link href="/register" className="w-full" onClick={() => setOpen(false)}>
            <button className="w-full h-12 rounded-2xl bg-[#58A06C] text-white font-bold text-lg tracking-wide shadow-[0_4px_20px_rgba(88,160,108,0.5)] hover:brightness-110 transition-all duration-200 cursor-pointer">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
