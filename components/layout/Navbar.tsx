"use client";
import Link from "next/link";
import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f6f3e7] dark:bg-[#211d18] border-b border-warm-border dark:border-cocoa-border shadow-[0_2px_20px_rgba(33,29,24,0.12)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.4)]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 h-[68px] flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect x="4" y="6" width="24" height="20" rx="3"
              fill="rgba(143,96,56,0.12)" stroke="#8f6038" strokeWidth="2" strokeLinejoin="round"/>
            <line x1="16" y1="6" x2="16" y2="26" stroke="#8f6038" strokeWidth="2"/>
            <line x1="8" y1="13" x2="13" y2="13" stroke="#a87a50" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="8" y1="17" x2="13" y2="17" stroke="#a87a50" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="8" y1="21" x2="13" y2="21" stroke="#a87a50" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="19" y1="13" x2="24" y2="13" stroke="#a87a50" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="19" y1="17" x2="24" y2="17" stroke="#a87a50" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M27 5 L28 3 L29 5 L31 6 L29 7 L28 9 L27 7 L25 6 Z" fill="#c4845a" opacity="0.8"/>
          </svg>
          <span className="font-hand text-[26px] font-bold text-cocoa dark:text-on-dark tracking-tight">
            Testify<span className="text-brand">AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink href="#how-it-works">How it works</NavLink>
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#faq">FAQ</NavLink>

          <div className="w-px h-6 bg-warm-border dark:bg-cocoa-border mx-2" />

          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted dark:text-muted-dark hover:bg-[rgba(143,96,56,0.12)] transition-colors duration-200 mr-1"
          >
            {theme === "dark" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          <Link href="/login">
            <button className="h-10 px-[22px] rounded-full border border-warm-border dark:border-cocoa-border bg-transparent text-cocoa dark:text-on-dark font-body font-bold text-[15px] cursor-pointer transition-all duration-200 hover:border-brand hover:bg-[rgba(143,96,56,0.1)]">
              Log in
            </button>
          </Link>

          <Link href="/register">
            <button className="h-10 px-[22px] rounded-full border-none bg-brand text-on-dark font-body font-bold text-[15px] cursor-pointer shadow-[0_4px_14px_rgba(143,96,56,0.4)] transition-all duration-200 hover:bg-brand-dark hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(143,96,56,0.5)]">
              Get started
            </button>
          </Link>
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted dark:text-muted-dark hover:bg-[rgba(143,96,56,0.12)] transition-colors duration-200"
          >
            {theme === "dark" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Open menu"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-cocoa dark:text-on-dark hover:bg-[rgba(143,96,56,0.12)] transition-colors duration-200"
          >
            {open ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#f6f3e7] dark:bg-[#211d18] border-t border-warm-border dark:border-cocoa-border px-6 pb-5 pt-3 flex flex-col gap-1">
          <MobileLink href="#how-it-works" onClick={() => setOpen(false)}>How it works</MobileLink>
          <MobileLink href="#features" onClick={() => setOpen(false)}>Features</MobileLink>
          <MobileLink href="#faq" onClick={() => setOpen(false)}>FAQ</MobileLink>
          <div className="border-t border-warm-border dark:border-cocoa-border my-3" />
          <Link href="/login" onClick={() => setOpen(false)}
            className="font-body font-bold text-[15px] text-cocoa dark:text-on-dark py-2.5 no-underline">
            Log in
          </Link>
          <Link href="/register" onClick={() => setOpen(false)}
            className="h-11 rounded-full bg-brand text-on-dark font-body font-bold text-[15px] flex items-center justify-center no-underline shadow-[0_4px_14px_rgba(143,96,56,0.4)]">
            Get started
          </Link>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="font-body text-[15px] font-semibold text-muted dark:text-muted-dark px-3.5 py-1.5 rounded-lg no-underline transition-all duration-200 hover:text-cocoa dark:hover:text-on-dark hover:bg-[rgba(143,96,56,0.1)]">
      {children}
    </a>
  );
}

function MobileLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <a href={href} onClick={onClick} className="font-body font-semibold text-[15px] text-muted dark:text-muted-dark py-2.5 no-underline hover:text-cocoa dark:hover:text-on-dark">
      {children}
    </a>
  );
}
