"use client";
import { useState } from "react";

/* ── Inline tokens — matches Hero.tsx / HowItWorks.tsx palette exactly ── */
const C = {
  bg: "#0b1032",
  bgMid: "#0f1729",
  bgCard: "#1a2235",
  bgCardHover: "#1e2845",
  border: "#2a3560",
  borderLight: "#2d3a58",
  primary: "#5B6AD0",
  primaryLight: "#8b95e8",
  accent: "#0097b2",
  textPrimary: "#d4d8f0",
  textSecondary: "#8892b0",
  textMuted: "#5a6490",
};

const F = {
  display: "'Nunito', 'Trebuchet MS', sans-serif",
  body: "'Nunito', sans-serif",
  mono: "'Fira Code', monospace",
};

const FAQS = [
  {
    q: "Who can use TestifyAI?",
    a: "TestifyAI is built for three main roles: administrators, teachers and students. Each role has its own dedicated flows and permissions inside the platform.",
  },
  {
    q: "How is an organization created?",
    a: "A new organization is created from the register flow. The user who creates it automatically becomes the first administrator of that organization.",
  },
  {
    q: "Do teachers and students create their own accounts?",
    a: "No. Teachers and students do not self-register. Their accounts are created and managed by the administrator of the organization.",
  },
  {
    q: "How are tests generated?",
    a: "Teachers can generate tests with AI based on course content, then review, edit and finalize the questions before making them available to students.",
  },
  {
    q: "Can students generate personalized tests?",
    a: "Yes. Students can select topics from a course and generate personalized tests to practice specific content they want to review.",
  },
  {
    q: "Can courses be assigned to classes?",
    a: "Yes. Courses can be assigned according to the teacher's allowed scope, so content reaches the right classes and students in an organized way.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section
      id="faq"
      style={{
        background: C.bgMid,
       padding: "60px 40px 120px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&family=Fira+Code:wght@400;500&display=swap');
      `}</style>

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            textAlign: "center",
            maxWidth: "680px",
            margin: "0 auto 64px",
          }}
        >
          <span
            style={{
              fontFamily: F.mono,
              fontSize: "11px",
              letterSpacing: "0.15em",
              color: C.primary,
              textTransform: "uppercase",
              background: "rgba(91,106,208,0.12)",
              padding: "6px 14px",
              borderRadius: "100px",
              border: "1px solid rgba(91,106,208,0.25)",
            }}
          >
            FAQ
          </span>

          <h2
            style={{
              fontFamily: F.display,
              fontSize: "clamp(28px, 4vw, 52px)",
              fontWeight: 900,
              color: C.textPrimary,
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: "-0.5px",
            }}
          >
            Frequently asked{" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              questions
            </span>
          </h2>

          <p
            style={{
              fontFamily: F.body,
              fontSize: "clamp(15px, 1.5vw, 18px)",
              color: C.textSecondary,
              margin: 0,
              lineHeight: 1.7,
              maxWidth: "560px",
              fontWeight: 600,
            }}
          >
            Quick answers about the platform, user roles and the learning flow.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gap: "16px",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          {FAQS.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={item.q}
                style={{
                  background: isOpen ? C.bgCardHover : C.bgCard,
                  border: `1px solid ${isOpen ? C.border : C.borderLight}`,
                  borderRadius: "20px",
                  overflow: "hidden",
                  boxShadow: isOpen
                    ? `0 0 30px rgba(91,106,208,0.12)`
                    : `0 0 18px rgba(91,106,208,0.05)`,
                  transition: "all 0.35s ease",
                  position: "relative",
                }}
              >
                <button
                  onClick={() => toggle(index)}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    cursor: "pointer",
                    padding: "24px 28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "18px",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      fontFamily: F.display,
                      fontSize: "18px",
                      fontWeight: 800,
                      color: isOpen ? C.textPrimary : C.textSecondary,
                      lineHeight: 1.35,
                      transition: "color 0.3s ease",
                    }}
                  >
                    {item.q}
                  </span>

                  <span
                    style={{
                      flexShrink: 0,
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      color: isOpen ? C.textPrimary : C.accent,
                      background: isOpen
                        ? "rgba(91,106,208,0.18)"
                        : "rgba(0,151,178,0.12)",
                      border: `1px solid ${isOpen ? "rgba(91,106,208,0.25)" : "rgba(0,151,178,0.2)"}`,
                      fontFamily: F.display,
                      fontSize: "18px",
                      fontWeight: 900,
                      transition: "all 0.3s ease",
                    }}
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                <div
                  style={{
                    maxHeight: isOpen ? "220px" : "0px",
                    opacity: isOpen ? 1 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.35s ease, opacity 0.25s ease",
                  }}
                >
                  <div
                    style={{
                      padding: "0 28px 24px 28px",
                      borderTop: `1px solid ${C.border}`,
                    }}
                  >
                    <p
                      style={{
                        margin: "18px 0 0",
                        fontFamily: F.body,
                        fontSize: "15px",
                        lineHeight: 1.8,
                        fontWeight: 600,
                        color: C.textSecondary,
                      }}
                    >
                      {item.a}
                    </p>
                  </div>
                </div>

                {isOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "3px",
                      background: `linear-gradient(90deg, ${C.primary}, ${C.accent})`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}