"use client";
import { useEffect, useRef, useState } from "react";

function useInView(threshold = 0.1) {
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

const FEATURES = [
  {
    icon: "🤖",
    title: "AI Test Generation",
    desc: "Teachers select any part of their course content and AI generates relevant multiple-choice questions instantly. Review, edit, and publish.",
  },
  {
    icon: "🌳",
    title: "Visual Course Builder",
    desc: "Build courses as a content tree with chapters, text, files, videos and tests. Reorder and reorganize with a clean drag interface.",
  },
  {
    icon: "📊",
    title: "Real Progress Tracking",
    desc: "Every test attempt is stored. Teachers see class averages and individual scores. Students see their own growth over time.",
  },
  {
    icon: "🏫",
    title: "Organization Management",
    desc: "One admin manages the whole school — teachers, students, classes and assignments — all from a single dashboard.",
  },
  {
    icon: "🎲",
    title: "Personalized Practice Tests",
    desc: "Students can select any topic from their courses and generate a fresh practice test on demand, with optional timer.",
  },
  {
    icon: "🔐",
    title: "Role-based Access",
    desc: "Three distinct roles — Admin, Teacher, Student — each with a tailored interface and the exact permissions they need.",
  },
];

export default function CoreFeatures() {
  const { ref, inView } = useInView();

  return (
    <section id="features" className="bg-cocoa pt-24 pb-32 px-6 md:px-10 relative overflow-hidden">

      {/* Dot grid bg */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.12] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="feat-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="16" cy="16" r="2" fill="#eeead8"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#feat-dots)"/>
      </svg>

      <div className="max-w-[1200px] mx-auto relative" ref={ref}>

        {/* Header */}
        <div
          className="text-center mb-14 transition-all duration-700"
          style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(24px)" }}
        >
          <span className="font-hand text-lg text-terra-light block mb-3">~ what&apos;s inside ~</span>
          <h2
            className="font-display font-black text-on-dark leading-[1.1] tracking-tight"
            style={{ fontSize: "clamp(28px, 4vw, 52px)" }}
          >
            Everything you need,
            <br />
            <span className="text-brand-light">nothing you don&apos;t</span>
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[2px] bg-cocoa-border rounded-3xl overflow-hidden">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className="bg-cocoa-card p-7 md:p-9 transition-all duration-500"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "none" : "translateY(28px)",
                transitionDelay: `${i * 80 + 200}ms`,
              }}
            >
              <div className="text-[34px] mb-4">{feature.icon}</div>
              <h3 className="font-display font-extrabold text-[17px] text-on-dark mb-2.5">{feature.title}</h3>
              <p className="font-body font-semibold text-sm text-muted-dark leading-[1.7]">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" className="block">
          <path d="M0 20 Q360 60 720 20 Q1080 -20 1440 20 L1440 60 L0 60 Z"
            className="fill-cream-alt dark:fill-cocoa"/>
        </svg>
      </div>
    </section>
  );
}
