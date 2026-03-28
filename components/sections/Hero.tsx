"use client";
import { useEffect, useRef, useState, useCallback } from "react";

/* ── Matrix rain canvas ── */
function MatrixAura() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const chars = "0123456789";
    const fontSize = 13;
    let cols = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(cols).fill(1).map(() => Math.random() * -50);

    const draw = () => {
      cols = Math.floor(canvas.width / fontSize);
      if (drops.length < cols) {
        for (let i = drops.length; i < cols; i++) drops.push(Math.random() * -50);
      }

      ctx.fillStyle = "rgba(13, 27, 62, 0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < cols; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const y = drops[i] * fontSize;

        ctx.fillStyle = `rgba(91, 106, 208, ${Math.random() * 0.4 + 0.6})`;
        ctx.font = `${fontSize}px 'Fira Code', monospace`;
        ctx.fillText(char, i * fontSize, y);

        if (Math.random() > 0.97) {
          ctx.fillStyle = `rgba(88, 160, 108, 0.9)`;
          ctx.fillText(char, i * fontSize, y);
        }

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.4;
      }
    };

    const interval = setInterval(draw, 40);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const outerBoundary =
    "radial-gradient(ellipse 80% 75% at 50% 44%, " +
    "black 52%, " +
    "rgba(0,0,0,0.5) 70%, " +
    "transparent 88%)";

  const innerHole =
    "radial-gradient(ellipse 46% 40% at 50% 43%, " +
    "transparent 78%, " +
    "black 90%)";

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        WebkitMaskImage: `${outerBoundary}, ${innerHole}`,
        maskImage: `${outerBoundary}, ${innerHole}`,
        WebkitMaskComposite: "destination-in",
        maskComposite: "intersect",
      }}
    />
  );
}

/* ── AI Test Question Window ── */
function AITestWindow({
  windowOpen,
  clicking,
  redBtnRef,
}: {
  windowOpen: boolean;
  clicking: boolean;
  redBtnRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [animStep, setAnimStep] = useState(0);

  useEffect(() => {
    if (!windowOpen) return;
    setSelected(null);
    setConfirmed(false);
    setAnimStep(0);
    const timers = [1, 2, 3, 4].map((step) =>
      setTimeout(() => setAnimStep(step), step * 280)
    );
    const t5 = setTimeout(() => setSelected(1), 1700);
    const t6 = setTimeout(() => setConfirmed(true), 2400);
    return () => { timers.forEach(clearTimeout); clearTimeout(t5); clearTimeout(t6); };
  }, [windowOpen]);

  const options = [
    "Metabolismul celular",
    "Codul genetic al organismului",
    "Sinteza proteinelor",
    "Structura membranei",
  ];

  return (
    <div
      style={{
        position: "absolute",
        inset: "5% 5%",
        background: "#1a2235",
        borderRadius: "12px",
        border: "1.5px solid #2d3a58",
        boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
        overflow: "hidden",
        opacity: windowOpen ? 1 : 0,
        transform: windowOpen ? "scale(1)" : "scale(0.93)",
        transition: "opacity 0.35s ease, transform 0.35s ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Title bar */}
      <div style={{
        height: "36px",
        flexShrink: 0,
        background: "#212d44",
        display: "flex",
        alignItems: "center",
        paddingLeft: "14px",
        gap: "9px",
        borderBottom: "1px solid #2d3a58",
      }}>
        <div
          ref={redBtnRef}
          style={{
            width: "13px", height: "13px", borderRadius: "50%",
            background: "#e05050",
            boxShadow: clicking ? "0 0 10px 4px rgba(224,80,80,0.8)" : "none",
            transition: "box-shadow 0.12s",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "9px", color: "rgba(0,0,0,0.45)", fontWeight: "bold", flexShrink: 0,
          }}
        >×</div>
        <div style={{ width: "13px", height: "13px", borderRadius: "50%", background: "#e0a030", flexShrink: 0 }} />
        <div style={{ width: "13px", height: "13px", borderRadius: "50%", background: "#40a860", flexShrink: 0 }} />
        <div style={{
          marginLeft: "auto",
          marginRight: "14px",
          display: "flex",
          alignItems: "center",
          gap: "5px",
          background: "rgba(0,151,178,0.12)",
          border: "1px solid rgba(0,151,178,0.3)",
          borderRadius: "100px",
          padding: "3px 10px",
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0097b2", boxShadow: "0 0 6px #0097b2", display: "inline-block" }} />
          <span style={{ fontFamily: "'Fira Code', monospace", fontSize: "10px", color: "#0097b2", fontWeight: 600 }}>AI generated</span>
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        padding: "clamp(12px,2.5%,22px) clamp(14px,3%,28px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "clamp(8px,1.5%,14px)",
      }}>
        {/* Progress bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "2px" }}>
          <div style={{ flex: 1, height: "3px", background: "#2a3560", borderRadius: "4px" }}>
            <div style={{ width: "30%", height: "100%", background: "linear-gradient(90deg, #5B6AD0, #0097b2)", borderRadius: "4px" }} />
          </div>
          <span style={{ fontFamily: "'Fira Code', monospace", fontSize: "10px", color: "#5a6490" }}>3 / 10</span>
        </div>

        {/* Question */}
        <p style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: "clamp(11px, 1.6vw, 17px)",
          fontWeight: 700,
          color: "#d4d8f0",
          margin: 0,
          lineHeight: 1.45,
        }}>
          Ce reprezintă secvența de baze azotate în ADN?
        </p>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(5px,1%,9px)" }}>
          {options.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = i === 1;
            const showResult = confirmed;
            const borderColor = showResult && isCorrect
              ? "#40a860"
              : showResult && isSelected && !isCorrect
              ? "#e05050"
              : isSelected
              ? "#5B6AD0"
              : "#2a3560";
            const bg = showResult && isCorrect
              ? "rgba(64,168,96,0.12)"
              : showResult && isSelected && !isCorrect
              ? "rgba(224,80,80,0.1)"
              : isSelected
              ? "rgba(91,106,208,0.12)"
              : "rgba(255,255,255,0.02)";

            return (
              <div
                key={i}
                onClick={() => !confirmed && setSelected(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "clamp(7px,1.2%,11px) clamp(10px,1.5%,14px)",
                  borderRadius: "8px",
                  border: `1px solid ${borderColor}`,
                  background: bg,
                  cursor: confirmed ? "default" : "pointer",
                  transition: "all 0.3s ease",
                  opacity: animStep > i ? 1 : 0,
                  transform: animStep > i ? "translateX(0)" : "translateX(-8px)",
                }}
              >
                <span style={{
                  width: "clamp(18px,2vw,24px)",
                  height: "clamp(18px,2vw,24px)",
                  borderRadius: "6px",
                  border: `1px solid ${borderColor}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Fira Code', monospace",
                  fontSize: "clamp(9px,1vw,12px)",
                  color: isSelected || (showResult && isCorrect) ? "#e8ecf8" : "#5a6490",
                  fontWeight: 700,
                  flexShrink: 0,
                  background: isSelected ? "rgba(91,106,208,0.2)" : "transparent",
                }}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: "clamp(10px,1.3vw,14px)",
                  color: isSelected || (showResult && isCorrect) ? "#d4d8f0" : "#8892b0",
                  fontWeight: isSelected ? 700 : 500,
                  transition: "color 0.3s",
                }}>
                  {opt}
                </span>
                {showResult && isCorrect && (
                  <span style={{ marginLeft: "auto", color: "#40a860", fontSize: "14px" }}>✓</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Main Hero ── */
export default function Hero() {
  const [cursorPos, setCursorPos] = useState({ x: 60, y: 55 });
  const [clicking, setClicking] = useState(false);
  const [windowOpen, setWindowOpen] = useState(true);
  const [showContent, setShowContent] = useState(false);

  const redBtnRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t1 = setTimeout(() => {
      if (redBtnRef.current && screenRef.current) {
        const btn = redBtnRef.current.getBoundingClientRect();
        const screen = screenRef.current.getBoundingClientRect();
        const x = ((btn.left - screen.left + btn.width / 2) / screen.width) * 100;
        const y = ((btn.top - screen.top + btn.height / 2) / screen.height) * 100;
        setCursorPos({ x, y });
      }
    }, 500);

    const t2 = setTimeout(() => setClicking(true), 1600);
    const t3 = setTimeout(() => {
      setClicking(false);
      setWindowOpen(false);
    }, 1950);
    const t4 = setTimeout(() => setShowContent(true), 2350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return (
    <section
      style={{
        position: "relative",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        minHeight: "100vh",
        paddingTop: "8vh",
        background: "#0b1032",
        overflow: "hidden",
      }}
    >
      {/* Matrix aura — full section, ring-masked around laptop */}
      <MatrixAura />

      {/* Glow behind laptop */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "900px",
          height: "600px",
          background:
            "radial-gradient(ellipse at center, rgba(91,106,208,0.18) 0%, transparent 65%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Laptop wrapper */}
      <div style={{ position: "relative", width: "min(94vw, 1050px)", zIndex: 2 }}>

        {/* Screen body */}
        <div
          style={{
            background: "#1a2340",
            borderRadius: "18px",
            border: "2.5px solid #2a3560",
            boxShadow:
              "0 0 0 1px #111a35, 0 30px 80px rgba(0,0,0,0.7), 0 0 80px rgba(91,106,208,0.15)",
            overflow: "hidden",
            aspectRatio: "16/10",
            position: "relative",
          }}
        >
          {/* Inner screen */}
          <div
            ref={screenRef}
            style={{
              position: "absolute",
              inset: 0,
              background: "#0f1729",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {/* ── AI TEST QUESTION WINDOW ── */}
            <AITestWindow
              windowOpen={windowOpen}
              clicking={clicking}
              redBtnRef={redBtnRef}
            />

            {/* ── CURSOR ── */}
            {!showContent && (
              <div
                style={{
                  position: "absolute",
                  left: `${cursorPos.x}%`,
                  top: `${cursorPos.y}%`,
                  transform: "translate(-3px, -3px)",
                  transition: "left 1s cubic-bezier(0.4,0,0.2,1), top 1s cubic-bezier(0.4,0,0.2,1)",
                  zIndex: 30,
                  pointerEvents: "none",
                }}
              >
                <svg
                  width="24" height="30" viewBox="0 0 22 28" fill="none"
                  style={{
                    filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.6))",
                    transform: clicking ? "scale(0.82)" : "scale(1)",
                    transition: "transform 0.1s",
                  }}
                >
                  <path d="M2 2L2 22L7.5 16.5L11 24L14 23L10.5 15.5H18L2 2Z" fill="white" stroke="#1a1a2e" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </div>
            )}

            {/* ── HERO CONTENT ── */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "20px",
                padding: "8%",
                opacity: showContent ? 1 : 0,
                transform: showContent ? "translateY(0)" : "translateY(18px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
              }}
            >
              <h2
                style={{
                  fontFamily: "'Nunito', 'Trebuchet MS', sans-serif",
                  fontWeight: 900,
                  fontSize: "clamp(26px, 5.5vw, 64px)",
                  lineHeight: 1.15,
                  textAlign: "center",
                  color: "#d4d8f0",
                  margin: 0,
                  letterSpacing: "-0.5px",
                }}
              >
                <span style={{ background: "linear-gradient(135deg, #5B6AD0, #8b95e8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Smart tests.
                </span>
                <br />
                Limitless learning.
              </h2>

              <p
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: "clamp(12px, 1.7vw, 18px)",
                  color: "#c8cce8",
                  textAlign: "center",
                  maxWidth: "680px",
                  margin: 0,
                  lineHeight: 1.6,
                  fontWeight: 600,
                  opacity: showContent ? 1 : 0,
                  transition: "opacity 0.7s ease 0.25s",
                }}
              >
                TestifyAI is redefining how people learn. Powered by AI, it instantly creates personalized tests, tracks your progress, and delivers exactly what you need to improve.
                No wasted time, no irrelevant content — just efficient, adaptive learning built around you.
              </p>

              {/* ── 3 Stat cards ── */}
              <div style={{
                display: "flex",
                gap: "clamp(16px, 3vw, 32px)",
                marginTop: "4px",
                opacity: showContent ? 1 : 0,
                transition: "opacity 0.6s ease 0.5s",
              }}>
                {[
                  { value: "3", label: "core roles in the product" },
                  { value: "1", label: "unified flow for org + admin" },
                  { value: "AI", label: "test generation from course content" },
                ].map(({ value, label }) => (
                  <div
                    key={value}
                    style={{
                      flex: 1,
                      background: "rgba(0, 151, 178, 0.07)",
                      border: "1px solid rgba(0, 151, 178, 0.3)",
                      borderRadius: "12px",
                      padding: "clamp(10px, 1.5vw, 16px) clamp(10px, 1.5vw, 14px)",
                      boxShadow: "0 0 18px rgba(0,151,178,0.25), 0 0 40px rgba(0,151,178,0.1), inset 0 1px 0 rgba(0,151,178,0.15)",
                      display: "flex",
                      flexDirection: "column" as const,
                      alignItems: "center",
                      gap: "6px",
                      textAlign: "center" as const,
                    }}
                  >
                    <span style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 900,
                      fontSize: "clamp(18px, 2.8vw, 36px)",
                      color: "#0097b2",
                      lineHeight: 1,
                      textShadow: "0 0 16px rgba(0,151,178,0.7)",
                    }}>
                      {value}
                    </span>
                    <span style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: "clamp(9px, 0.9vw, 11px)",
                      color: "#7bbfcc",
                      lineHeight: 1.35,
                      fontWeight: 600,
                    }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hinge */}
        <div style={{ height: "clamp(8px, 2vw, 16px)", background: "linear-gradient(to bottom, #1c2540, #151d35)", borderRadius: "0 0 4px 4px", marginTop: "-1px" }} />

        {/* Base */}
        <div
          style={{
            height: "clamp(22px, 4.5vw, 44px)",
            background: "linear-gradient(to bottom, #1c2540 0%, #131c30 60%, #0f1625 100%)",
            borderRadius: "0 0 14px 14px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
            position: "relative",
          }}
        >
          <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: "20%", height: "50%", background: "rgba(255,255,255,0.04)", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.06)" }} />
        </div>

        {/* Shadow */}
        <div style={{ position: "absolute", bottom: "-30px", left: "10%", right: "10%", height: "30px", background: "radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, transparent 70%)", filter: "blur(8px)" }} />

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&family=Fira+Code:wght@400;500&display=swap');
      `}</style>
    </section>
  );
}