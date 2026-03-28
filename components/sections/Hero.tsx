"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const handler = () => setY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return y;
}

function DoodleScene() {
  return (
    <svg
      viewBox="0 0 480 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[420px] lg:max-w-[480px]"
      aria-hidden="true"
    >
      <defs>
        <filter id="hero-rough" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="5" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>

      <ellipse cx="240" cy="255" rx="200" ry="190" fill="#e5dfc9" opacity="0.7"/>

      <g filter="url(#hero-rough)">
        <path
          d="M240 100 C210 100 188 122 188 152 C188 172 200 188 208 200 L208 218 L272 218 L272 200 C280 188 292 172 292 152 C292 122 270 100 240 100 Z"
          fill="#f5f1e6" stroke="#8f6038" strokeWidth="3" strokeLinejoin="round"
        />
        <path d="M208 218 L272 218" stroke="#8f6038" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M212 226 L268 226" stroke="#8f6038" strokeWidth="2" strokeLinecap="round"/>
        <path d="M218 233 L262 233" stroke="#8f6038" strokeWidth="1.5" strokeLinecap="round"/>
      </g>
      <text x="240" y="168" textAnchor="middle" fontSize="32" fontWeight="800"
        fill="#8f6038" fontFamily="Caveat, cursive" opacity="0.9">AI</text>
      <ellipse cx="220" cy="130" rx="10" ry="15" fill="white" opacity="0.35" transform="rotate(-20,220,130)"/>

      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 240 + 100 * Math.cos(rad), y1 = 152 + 100 * Math.sin(rad);
        const x2 = 240 + 115 * Math.cos(rad), y2 = 152 + 115 * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#c4845a" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>;
      })}

      <g filter="url(#hero-rough)">
        <ellipse cx="240" cy="378" rx="110" ry="12" fill="#c8b898" opacity="0.5"/>
        <path d="M130 290 C130 278 155 270 240 268 L240 370 C155 370 130 362 130 350 Z"
          fill="#f5f1e6" stroke="#8f6038" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M350 290 C350 278 325 270 240 268 L240 370 C325 370 350 362 350 350 Z"
          fill="#f5f1e6" stroke="#8f6038" strokeWidth="2.5" strokeLinejoin="round"/>
        <line x1="240" y1="268" x2="240" y2="370" stroke="#8f6038" strokeWidth="3"/>
        {[0, 1, 2, 3].map(i => (
          <line key={i} x1={148} y1={300 + i * 16} x2={228} y2={300 + i * 16}
            stroke="#c8b898" strokeWidth="2.5" strokeLinecap="round"/>
        ))}
        <line x1="148" y1="364" x2="195" y2="364" stroke="#c8b898" strokeWidth="2.5" strokeLinecap="round"/>
        {[0, 1, 2, 3].map(i => (
          <line key={i} x1={252} y1={300 + i * 16} x2={332} y2={300 + i * 16}
            stroke="#c8b898" strokeWidth="2.5" strokeLinecap="round"/>
        ))}
        <line x1="252" y1="364" x2="300" y2="364" stroke="#c8b898" strokeWidth="2.5" strokeLinecap="round"/>
      </g>

      <g transform="rotate(-35 370 340)" filter="url(#hero-rough)">
        <rect x="355" y="290" width="18" height="80" rx="3" fill="#d9a07a" stroke="#8f6038" strokeWidth="2"/>
        <polygon points="355,370 373,370 364,393" fill="#f5f1e6" stroke="#8f6038" strokeWidth="2"/>
        <circle cx="364" cy="391" r="2.5" fill="#211d18"/>
        <rect x="355" y="286" width="18" height="6" rx="2" fill="#c4845a" stroke="#8f6038" strokeWidth="1.5"/>
        <rect x="357" y="278" width="14" height="10" rx="2" fill="#e8c0b0" stroke="#8f6038" strokeWidth="1.5"/>
        <line x1="364" y1="290" x2="364" y2="370" stroke="#8f6038" strokeWidth="1" opacity="0.35"/>
      </g>

      {[
        { cx: 90, cy: 160, r: 7, op: 0.75 },
        { cx: 395, cy: 130, r: 5, op: 0.65 },
        { cx: 60, cy: 310, r: 5, op: 0.55 },
        { cx: 420, cy: 260, r: 4, op: 0.50 },
        { cx: 340, cy: 420, r: 6, op: 0.60 },
      ].map(({ cx, cy, r, op }, i) => (
        <g key={i} opacity={op}>
          <path
            d={`M${cx} ${cy - r} L${cx + r * .35} ${cy - r * .35} L${cx + r} ${cy} L${cx + r * .35} ${cy + r * .35} L${cx} ${cy + r} L${cx - r * .35} ${cy + r * .35} L${cx - r} ${cy} L${cx - r * .35} ${cy - r * .35} Z`}
            fill="#c4845a" stroke="#8f6038" strokeWidth="1"
          />
        </g>
      ))}

      <circle cx="78" cy="225" r="10" fill="none" stroke="#8f6038" strokeWidth="2" opacity="0.45"/>
      <circle cx="410" cy="320" r="14" fill="none" stroke="#c4845a" strokeWidth="2" opacity="0.4"/>
      <circle cx="100" cy="380" r="7" fill="#d9a07a" opacity="0.5"/>
      <circle cx="380" cy="200" r="8" fill="#a87a50" opacity="0.35"/>

      <path d="M60 130 Q68 120 76 130 Q84 140 92 130 Q100 120 108 130"
        stroke="#8f6038" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
      <path d="M370 370 Q378 360 386 370 Q394 380 402 370 Q410 360 418 370"
        stroke="#c4845a" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.45"/>

      {[[130, 105], [310, 88], [430, 160], [50, 270], [155, 415], [390, 430]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3.5" fill="#a87a50" opacity="0.45"/>
      ))}
    </svg>
  );
}

function ParallaxDoodles({ scrollY }: { scrollY: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute -left-[8%] top-[10%] w-[460px] h-[460px] rounded-full bg-[radial-gradient(circle,#e5dfc9_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(143,96,56,0.08)_0%,transparent_70%)]"
        style={{ transform: `translateY(${scrollY * 0.08}px)` }}
      />
      <div
        className="absolute -right-[6%] top-[30%] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(143,96,56,0.07)_0%,transparent_70%)]"
        style={{ transform: `translateY(${scrollY * 0.12}px)` }}
      />
      <svg
        className="absolute top-[15%] right-[5%] opacity-25 dark:opacity-20"
        style={{ transform: `translateY(${scrollY * 0.18}px)` }}
        width="120" height="120" viewBox="0 0 120 120"
      >
        {[0, 1, 2, 3].map(row => [0, 1, 2, 3].map(col => (
          <circle key={`${row}-${col}`} cx={col * 32 + 16} cy={row * 32 + 16} r="3.5" fill="#8f6038"/>
        )))}
      </svg>
      <svg
        className="absolute top-[8%] left-[38%] opacity-20"
        style={{ transform: `translateY(${scrollY * 0.22}px)` }}
        width="180" height="30" viewBox="0 0 180 30"
      >
        <path d="M0 15 Q22 5 45 15 Q68 25 90 15 Q112 5 135 15 Q158 25 180 15"
          stroke="#8f6038" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </svg>
      <svg
        className="absolute bottom-[25%] left-[6%] opacity-35 dark:opacity-25"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        width="60" height="60" viewBox="0 0 60 60"
      >
        <path d="M30 5 L34 24 L53 24 L38 36 L44 55 L30 43 L16 55 L22 36 L7 24 L26 24 Z"
          stroke="#8f6038" strokeWidth="2" fill="rgba(143,96,56,0.12)" strokeLinejoin="round"/>
      </svg>
      <svg
        className="absolute top-[55%] right-[10%] opacity-25"
        style={{ transform: `translateY(${scrollY * 0.25}px)` }}
        width="36" height="36" viewBox="0 0 36 36"
      >
        <line x1="18" y1="4" x2="18" y2="32" stroke="#c4845a" strokeWidth="3" strokeLinecap="round"/>
        <line x1="4" y1="18" x2="32" y2="18" stroke="#c4845a" strokeWidth="3" strokeLinecap="round"/>
      </svg>
      <svg
        className="absolute bottom-[12%] right-[22%] opacity-20"
        style={{ transform: `translateY(${scrollY * 0.14}px)` }}
        width="50" height="50" viewBox="0 0 50 50"
      >
        <path d="M25 5 L48 44 L2 44 Z" stroke="#8f6038" strokeWidth="2" fill="none" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

export default function Hero() {
  const scrollY = useScrollY();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative bg-cream dark:bg-cocoa min-h-screen flex items-center overflow-hidden pt-[68px]">
      <ParallaxDoodles scrollY={scrollY} />

      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center relative z-10 w-full">

        {/* Text */}
        <div
          className="transition-all duration-700 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(28px)",
          }}
        >
          <div className="inline-flex items-center gap-2 bg-[rgba(143,96,56,0.12)] border border-warm-border dark:border-cocoa-border rounded-full px-4 py-1.5 mb-7">
            <span className="text-base">✦</span>
            <span className="font-hand text-base font-semibold text-brand">AI-powered learning platform</span>
          </div>

          <h1
            className="font-display font-black text-cocoa dark:text-on-dark leading-[1.1] tracking-tight mb-6"
            style={{ fontSize: "clamp(38px, 5.5vw, 70px)" }}
          >
            The smarter way
            <br />
            to{" "}
            <span className="relative inline-block text-brand">
              learn & teach
              <svg viewBox="0 0 240 18" fill="none" className="absolute -bottom-1.5 left-0 w-full" preserveAspectRatio="none">
                <path d="M4 10 Q30 4 60 10 Q90 16 120 10 Q150 4 180 10 Q210 16 236 8"
                  stroke="#c4845a" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
              </svg>
            </span>
          </h1>

          <p
            className="font-body text-muted dark:text-muted-dark leading-[1.75] max-w-[480px] mb-10 transition-opacity duration-700 delay-200 font-semibold"
            style={{ fontSize: "clamp(16px, 1.6vw, 19px)", opacity: visible ? 1 : 0 }}
          >
            TestifyAI brings together admins, teachers and students in one platform.
            Build courses, generate AI-powered tests, and track real progress — all in one place.
          </p>

          <div
            className="flex gap-3.5 flex-wrap transition-opacity duration-700 delay-[350ms]"
            style={{ opacity: visible ? 1 : 0 }}
          >
            <Link href="/register">
              <button className="h-[52px] px-8 rounded-full bg-brand text-on-dark font-body font-extrabold text-base cursor-pointer shadow-[0_6px_24px_rgba(143,96,56,0.45)] transition-all duration-200 hover:bg-brand-dark hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(143,96,56,0.5)] flex items-center gap-2">
                Create your organization
                <span className="text-lg">→</span>
              </button>
            </Link>
            <a href="#how-it-works">
              <button className="h-[52px] px-7 rounded-full border border-warm-border dark:border-cocoa-border bg-transparent text-cocoa dark:text-on-dark font-body font-bold text-base cursor-pointer transition-all duration-200 hover:border-brand hover:bg-[rgba(143,96,56,0.1)]">
                See how it works
              </button>
            </a>
          </div>

          <div
            className="flex gap-8 mt-12 pt-7 border-t border-warm-border dark:border-cocoa-border transition-opacity duration-700 delay-500"
            style={{ opacity: visible ? 1 : 0 }}
          >
            {[
              { value: "3", label: "user roles" },
              { value: "AI", label: "test generation" },
              { value: "∞", label: "learning potential" },
            ].map(({ value, label }) => (
              <div key={value}>
                <div className="font-hand text-[32px] font-bold text-brand leading-none">{value}</div>
                <div className="font-body text-[13px] text-muted dark:text-muted-dark mt-1 font-semibold">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Illustration */}
        <div
          className="flex justify-center items-center order-first lg:order-last"
          style={{
            opacity: visible ? 1 : 0,
            transform: `translateY(${scrollY * -0.04}px)`,
            transition: "opacity 0.8s ease 0.15s",
          }}
        >
          <DoodleScene />
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" className="block">
          <path d="M0 30 Q180 60 360 30 Q540 0 720 30 Q900 60 1080 30 Q1260 0 1440 30 L1440 60 L0 60 Z"
            className="fill-cocoa"/>
        </svg>
      </div>
    </section>
  );
}
