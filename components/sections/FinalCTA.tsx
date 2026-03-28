"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export default function FinalCTA() {
  const { ref, inView } = useInView();

  return (
    <section className="bg-cocoa px-6 md:px-10 py-24 md:py-28 relative overflow-hidden">

      {/* Background dot pattern */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="cta-dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="2.5" fill="#eeead8"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cta-dots)"/>
      </svg>

      {/* Floating doodles */}
      <svg className="absolute top-10 left-10 md:left-16 opacity-20 animate-float-slow" width="60" height="60" viewBox="0 0 60 60" fill="none">
        <path d="M30 5 L34 24 L53 24 L38 36 L44 55 L30 43 L16 55 L22 36 L7 24 L26 24 Z"
          stroke="#8f6038" strokeWidth="2" fill="rgba(143,96,56,0.2)" strokeLinejoin="round"/>
      </svg>
      <svg className="absolute bottom-14 right-10 md:right-20 opacity-15 animate-float" width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M24 4 L27 18 L41 18 L30 27 L34 41 L24 32 L14 41 L18 27 L7 18 L21 18 Z"
          stroke="#c4845a" strokeWidth="2" fill="none" strokeLinejoin="round"/>
      </svg>
      <svg className="absolute top-1/3 right-8 md:right-12 opacity-15 animate-float-slow" width="36" height="36" viewBox="0 0 36 36">
        <line x1="18" y1="4" x2="18" y2="32" stroke="#a87a50" strokeWidth="3" strokeLinecap="round"/>
        <line x1="4" y1="18" x2="32" y2="18" stroke="#a87a50" strokeWidth="3" strokeLinecap="round"/>
      </svg>

      <div
        ref={ref}
        className="max-w-[700px] mx-auto text-center relative transition-all duration-700"
        style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(28px)" }}
      >
        <span className="font-hand text-xl text-brand-light block mb-4">~ ready to get started? ~</span>

        <h2
          className="font-display font-black text-on-dark leading-[1.1] tracking-tight mb-6"
          style={{ fontSize: "clamp(32px, 5vw, 60px)" }}
        >
          Your smarter school
          <br />
          starts today
        </h2>

        <p className="font-body text-base md:text-lg font-semibold text-muted-dark leading-relaxed mb-10 max-w-[520px] mx-auto">
          Create your organization, invite your team, and let AI do the heavy lifting.
          No credit card required.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/register">
            <button className="h-[52px] md:h-[56px] px-7 md:px-9 rounded-full bg-brand text-on-dark font-body font-extrabold text-base md:text-[17px] cursor-pointer shadow-[0_8px_28px_rgba(143,96,56,0.5)] transition-all duration-200 hover:bg-brand-dark hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(143,96,56,0.6)] flex items-center gap-2">
              Create your organization
              <span className="text-xl">→</span>
            </button>
          </Link>
          <Link href="/login">
            <button className="h-[52px] md:h-[56px] px-7 md:px-8 rounded-full border border-cocoa-border bg-transparent text-on-dark font-body font-bold text-base md:text-[17px] cursor-pointer transition-all duration-200 hover:border-brand-light hover:bg-[rgba(143,96,56,0.1)]">
              Already have an account
            </button>
          </Link>
        </div>

        <p className="font-hand text-base text-subtle mt-8">
          ✦ free to try &nbsp;·&nbsp; no credit card &nbsp;·&nbsp; set up in minutes ✦
        </p>
      </div>
    </section>
  );
}
