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

const ROLES = [
  {
    icon: "🏛️",
    role: "Admin",
    tagline: "Full control, zero chaos",
    benefits: [
      "Create your organization in minutes",
      "Add teachers and students in bulk",
      "Manage classes and assign teachers",
      "See an overview of all activity",
    ],
    checkColor: "text-brand",
    checkBg: "bg-[rgba(143,96,56,0.15)]",
    checkBorder: "border-brand",
    badgeColor: "text-brand dark:text-brand-light",
    badgeBg: "bg-[rgba(143,96,56,0.12)]",
  },
  {
    icon: "🎓",
    role: "Teacher",
    tagline: "Build better courses, faster",
    benefits: [
      "Create rich, structured courses",
      "Generate tests with AI from your content",
      "Assign courses to specific classes",
      "Track student progress and scores",
    ],
    checkColor: "text-terra",
    checkBg: "bg-[rgba(196,132,90,0.15)]",
    checkBorder: "border-terra",
    badgeColor: "text-terra dark:text-terra-light",
    badgeBg: "bg-[rgba(196,132,90,0.12)]",
  },
  {
    icon: "📖",
    role: "Student",
    tagline: "Study smarter, not harder",
    benefits: [
      "Access all assigned courses in one place",
      "Generate personalized practice tests",
      "See detailed results and explanations",
      "Track your own progress over time",
    ],
    checkColor: "text-brand-light",
    checkBg: "bg-[rgba(168,122,80,0.15)]",
    checkBorder: "border-brand-light",
    badgeColor: "text-brand-light",
    badgeBg: "bg-[rgba(168,122,80,0.12)]",
  },
];

export default function BenefitsByRole() {
  const { ref, inView } = useInView();

  return (
    <section className="bg-cream dark:bg-cocoa-card px-6 md:px-10 py-24">
      <div className="max-w-[1200px] mx-auto" ref={ref}>

        {/* Header */}
        <div
          className="text-center mb-14 transition-all duration-700"
          style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(24px)" }}
        >
          <span className="font-hand text-lg text-brand block mb-3">
            ~ for everyone in your school ~
          </span>
          <h2
            className="font-display font-black text-cocoa dark:text-on-dark leading-[1.1] tracking-tight"
            style={{ fontSize: "clamp(28px, 4vw, 52px)" }}
          >
            Built for every role
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ROLES.map((role, i) => (
            <div
              key={role.role}
              className="bg-cream-card dark:bg-cocoa rounded-3xl p-7 md:p-9 border border-warm-border dark:border-cocoa-border shadow-[0_4px_20px_rgba(33,29,24,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all duration-700"
              style={{
                opacity: inView ? 1 : 0,
                transitionDelay: `${i * 120 + 200}ms`,
              }}
            >
              <div className="text-[44px] mb-4">{role.icon}</div>

              <div className={`inline-block font-body text-xs font-extrabold ${role.badgeColor} ${role.badgeBg} px-3 py-1 rounded-full uppercase tracking-wide mb-3`}>
                {role.role}
              </div>

              <h3 className="font-display font-extrabold text-xl text-cocoa dark:text-on-dark mb-5 leading-snug">
                {role.tagline}
              </h3>

              <ul className="flex flex-col gap-3">
                {role.benefits.map(benefit => (
                  <li key={benefit} className="flex items-start gap-2.5 font-body text-[14.5px] font-semibold text-muted dark:text-muted-dark leading-snug">
                    <span className={`w-5 h-5 rounded-full ${role.checkBg} border ${role.checkBorder} flex items-center justify-center shrink-0 text-[11px] font-extrabold ${role.checkColor} mt-px`}>
                      ✓
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
