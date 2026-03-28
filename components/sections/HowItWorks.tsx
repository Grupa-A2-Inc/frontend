"use client";
import { useEffect, useRef, useState } from "react";

function useInView(threshold = 0.15) {
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

const STEPS = [
  {
    number: "01",
    emoji: "🏢",
    title: "Create your organization",
    desc: "Register your school or institution and become its administrator. The whole setup takes under two minutes.",
  },
  {
    number: "02",
    emoji: "👥",
    title: "Add teachers & students",
    desc: "Invite teachers and students via email. They each receive a temporary password and can log in immediately.",
  },
  {
    number: "03",
    emoji: "📚",
    title: "Build AI-powered courses",
    desc: "Teachers create courses with rich content and let AI generate tests from the material — then review and publish.",
  },
  {
    number: "04",
    emoji: "🎯",
    title: "Study, test, and grow",
    desc: "Students work through courses, take tests, and track their real progress over time.",
  },
];

function DoodleArrow() {
  return (
    <svg width="40" height="24" viewBox="0 0 48 24" fill="none" className="shrink-0 hidden xl:block">
      <path d="M2 12 Q12 6 24 12 Q36 18 46 12"
        stroke="#40352a" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
      <path d="M40 8 L46 12 L40 16"
        stroke="#40352a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
    </svg>
  );
}

export default function HowItWorks() {
  const { ref, inView } = useInView();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => setActive(v => (v + 1) % STEPS.length), 2600);
    return () => clearInterval(t);
  }, [inView]);

  return (
    <section id="how-it-works" className="bg-cocoa pt-24 pb-32 px-6 md:px-10 relative">
      <div className="max-w-[1200px] mx-auto" ref={ref}>

        {/* Header */}
        <div
          className="text-center mb-14 md:mb-18 transition-all duration-700 ease-out"
          style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(24px)" }}
        >
          <span className="font-hand text-lg font-semibold text-brand-light block mb-3">
            ~ how it works ~
          </span>
          <h2
            className="font-display font-black text-on-dark leading-[1.1] tracking-tight"
            style={{ fontSize: "clamp(30px, 4.5vw, 56px)" }}
          >
            Four steps from setup
            <br />
            <span className="text-brand-light">to real progress</span>
          </h2>
        </div>

        {/* Steps — horizontal on xl, 2×2 grid on md, vertical on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:flex xl:items-start gap-4 xl:gap-0">
          {STEPS.map((step, i) => (
            <div key={step.number} className={`xl:flex xl:items-center ${i < STEPS.length - 1 ? "xl:flex-1" : ""}`}>
              <div
                onClick={() => setActive(i)}
                className={`rounded-2xl p-6 xl:p-7 cursor-pointer border transition-all duration-300 relative ${
                  active === i
                    ? "bg-cocoa-card border-brand -translate-y-1"
                    : "bg-white/[0.04] border-cocoa-border"
                }`}
                style={{
                  opacity: inView ? 1 : 0,
                  transitionDelay: `${i * 120 + 200}ms`,
                }}
              >
                <div className={`absolute top-0 left-5 right-5 h-[3px] rounded-b-[4px] transition-all duration-300 ${
                  active === i ? "bg-gradient-to-r from-brand to-terra" : "bg-transparent"
                }`}/>
                <div className="text-[34px] mb-3">{step.emoji}</div>
                <div className={`font-hand text-[13px] tracking-wider mb-2 transition-colors duration-300 ${
                  active === i ? "text-brand-light" : "text-subtle"
                }`}>
                  step {step.number}
                </div>
                <h3 className={`font-display font-extrabold text-[15px] mb-2 leading-snug transition-colors duration-300 ${
                  active === i ? "text-on-dark" : "text-muted-dark"
                }`}>
                  {step.title}
                </h3>
                <p className={`font-body font-semibold text-[13px] text-muted-dark leading-relaxed transition-opacity duration-300 ${
                  active === i ? "opacity-100" : "opacity-55"
                }`}>
                  {step.desc}
                </p>
              </div>

              {i < STEPS.length - 1 && (
                <div className="hidden xl:flex flex-1 justify-center">
                  <DoodleArrow />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        <div
          className="flex justify-center gap-2 mt-8 transition-opacity duration-700 delay-700"
          style={{ opacity: inView ? 1 : 0 }}
        >
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-2 rounded-full border-none cursor-pointer transition-all duration-300 ${
                active === i ? "w-6 bg-brand" : "w-2 bg-cocoa-border"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" className="block">
          <path d="M0 40 Q360 10 720 40 Q1080 70 1440 40 L1440 60 L0 60 Z"
            className="fill-cream dark:fill-cocoa-card"/>
        </svg>
      </div>
    </section>
  );
}
