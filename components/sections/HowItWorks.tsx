"use client";
import { useEffect, useRef, useState } from "react";

/* ── Inline tokens — matches Hero.tsx palette exactly ── */
const C = {
  bg:          "#0b1032",
  bgMid:       "#0f1729",
  bgCard:      "#1a2235",
  bgCardHover: "#1e2845",
  border:      "#2a3560",
  borderLight: "#2d3a58",
  primary:     "#5B6AD0",
  primaryLight:"#8b95e8",
  accent:      "#0097b2",
  textPrimary: "#d4d8f0",
  textSecondary:"#8892b0",
  textMuted:   "#5a6490",
};

const F = {
  display: "'Nunito', 'Trebuchet MS', sans-serif",
  body:    "'Nunito', sans-serif",
  mono:    "'Fira Code', monospace",
};

const STEPS = [
  {
    step: "01",
    title: "Create your organization",
    desc: "Any user can create an organization and automatically becomes the first administrator.",
  },
  {
    step: "02",
    title: "Configure the platform",
    desc: "The admin adds teachers, students and classes, then sets up the initial structure of the organization.",
  },
  {
    step: "03",
    title: "Teachers build courses",
    desc: "Courses are built visually, and tests can be AI-generated and then edited before publishing.",
  },
  {
    step: "04",
    title: "Students study and practice",
    desc: "Students go through the content, take tests and track their progress on each course.",
  },
];

/* ── useInView hook (inline, no external dep) ── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export default function HowItWorksSection() {
  const { ref, inView } = useInView();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => setActiveStep(v => (v + 1) % STEPS.length), 2500);
    return () => clearInterval(t);
  }, [inView]);

  return (
    <section
      id="how-it-works"
      style={{ background: C.bgMid, padding: "120px 40px" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&family=Fira+Code:wght@400;500&display=swap');
      `}</style>

      <div style={{ maxWidth: "1200px", margin: "0 auto" }} ref={ref}>

        {/* ── Section header ── */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          textAlign: "center",
          maxWidth: "680px",
          margin: "0 auto",
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}>
          <span style={{
            fontFamily: F.mono,
            fontSize: "11px",
            letterSpacing: "0.15em",
            color: C.primary,
            textTransform: "uppercase" as const,
            background: `rgba(91,106,208,0.12)`,
            padding: "6px 14px",
            borderRadius: "100px",
            border: `1px solid rgba(91,106,208,0.25)`,
          }}>
            How it works
          </span>

          <h2 style={{
            fontFamily: F.display,
            fontSize: "clamp(28px, 4vw, 52px)",
            fontWeight: 900,
            color: C.textPrimary,
            margin: 0,
            lineHeight: 1.1,
            letterSpacing: "-0.5px",
          }}>
            A simple flow,{" "}
            <span style={{
              background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              from setup to progress
            </span>
          </h2>

          <p style={{
            fontFamily: F.body,
            fontSize: "clamp(15px, 1.5vw, 18px)",
            color: C.textSecondary,
            margin: 0,
            lineHeight: 1.7,
            maxWidth: "560px",
            fontWeight: 600,
          }}>
            The platform is designed as a clear path: admins configure
            the organization, teachers build courses, and students learn.
          </p>
        </div>

        {/* ── Steps grid ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "2px",
          marginTop: "64px",
          background: C.border,
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: `0 0 60px rgba(91,106,208,0.08)`,
        }}>
          {STEPS.map(({ step, title, desc }, i) => {
            const isActive = activeStep === i;
            return (
              <div
                key={step}
                onClick={() => setActiveStep(i)}
                style={{
                  background: isActive ? C.bgCard : C.bg,
                  padding: "40px 32px",
                  cursor: "pointer",
                  transition: "background 0.4s ease, opacity 0.5s ease, transform 0.5s ease",
                  position: "relative",
                  opacity: inView ? 1 : 0,
                  transform: inView ? "translateY(0)" : "translateY(30px)",
                  transitionDelay: `${i * 100 + 200}ms`,
                }}
              >
                {/* Active top bar */}
                <div style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0,
                  height: "3px",
                  background: isActive
                    ? `linear-gradient(90deg, ${C.primary}, ${C.accent})`
                    : "transparent",
                  transition: "background 0.4s",
                }} />

                {/* Step number */}
                <div style={{
                  fontFamily: F.mono,
                  fontSize: "11px",
                  color: isActive ? C.accent : C.textMuted,
                  letterSpacing: "0.15em",
                  marginBottom: "16px",
                  transition: "color 0.4s",
                }}>
                  {step}
                </div>

                {/* Title */}
                <h3 style={{
                  fontFamily: F.display,
                  fontSize: "18px",
                  fontWeight: 800,
                  color: isActive ? C.textPrimary : C.textSecondary,
                  margin: "0 0 12px",
                  transition: "color 0.4s",
                }}>
                  {title}
                </h3>

                {/* Description */}
                <p style={{
                  fontFamily: F.body,
                  fontSize: "14px",
                  fontWeight: 600,
                  color: C.textSecondary,
                  margin: 0,
                  lineHeight: 1.65,
                  opacity: isActive ? 1 : 0.55,
                  transition: "opacity 0.4s",
                }}>
                  {desc}
                </p>

                {/* Active glow dot bottom-right */}
                {isActive && (
                  <div style={{
                    position: "absolute",
                    bottom: "20px",
                    right: "24px",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: C.accent,
                    boxShadow: `0 0 10px ${C.accent}`,
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}