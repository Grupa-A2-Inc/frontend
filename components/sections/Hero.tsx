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

      // Fade effect — dark overlay with transparency
      ctx.fillStyle = "rgba(13, 27, 62, 0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < cols; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const y = drops[i] * fontSize;

        // Head glyph brighter
        ctx.fillStyle = `rgba(91, 106, 208, ${Math.random() * 0.4 + 0.6})`;
        ctx.font = `${fontSize}px 'Fira Code', monospace`;
        ctx.fillText(char, i * fontSize, y);

        // Occasional green accent
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

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        // Vignette mask — fade out toward center so laptop stays clean
        WebkitMaskImage:
          "radial-gradient(ellipse 72% 65% at 50% 44%, transparent 38%, rgba(0,0,0,0.15) 52%, rgba(0,0,0,0.55) 68%, black 85%)",
        maskImage:
          "radial-gradient(ellipse 72% 65% at 50% 44%, transparent 38%, rgba(0,0,0,0.15) 52%, rgba(0,0,0,0.55) 68%, black 85%)",
      }}
    />
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
        background: "#0d1b3e",
        overflow: "hidden",
      }}
    >
      {/* Matrix aura — full section */}
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
            {/* ── CODE EDITOR WINDOW ── */}
            <div
              style={{
                position: "absolute",
                inset: "5% 5%",
                background: "#1e2535",
                borderRadius: "10px",
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
              <div
                style={{
                  height: "38px",
                  flexShrink: 0,
                  background: "#252e45",
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: "16px",
                  gap: "9px",
                  borderBottom: "1px solid #2d3a58",
                }}
              >
                <div
                  ref={redBtnRef}
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    background: "#e05050",
                    boxShadow: clicking
                      ? "0 0 10px 4px rgba(224,80,80,0.8)"
                      : "none",
                    transition: "box-shadow 0.12s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    color: "rgba(0,0,0,0.45)",
                    fontWeight: "bold",
                    flexShrink: 0,
                  }}
                >
                  ×
                </div>
                <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "#e0a030", flexShrink: 0 }} />
                <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "#40a860", flexShrink: 0 }} />
              </div>

              {/* Code content */}
              <div
                style={{
                  flex: 1,
                  padding: "clamp(16px, 3%, 36px) clamp(20px, 4%, 48px)",
                  fontFamily: "'Fira Code', 'Courier New', monospace",
                  fontSize: "clamp(16px, 2.6vw, 32px)",
                  lineHeight: 1.85,
                  color: "#8892b0",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div><span style={{ color: "#6272a4" }}>&lt;</span><span style={{ color: "#8be9fd" }}>html</span><span style={{ color: "#6272a4" }}>&gt;</span></div>
                <div style={{ paddingLeft: "2em" }}><span style={{ color: "#6272a4" }}>&lt;</span><span style={{ color: "#8be9fd" }}>head</span><span style={{ color: "#6272a4" }}>&gt;</span></div>
                <div style={{ paddingLeft: "4em" }}>
                  <span style={{ color: "#6272a4" }}>&lt;</span><span style={{ color: "#8be9fd" }}>title</span><span style={{ color: "#6272a4" }}>&gt;</span>
                  <span style={{ color: "#f1fa8c" }}>My learning App</span>
                  <span style={{ color: "#6272a4" }}>&lt;/</span><span style={{ color: "#8be9fd" }}>title</span><span style={{ color: "#6272a4" }}>&gt;</span>
                </div>
                <div style={{ paddingLeft: "2em" }}><span style={{ color: "#6272a4" }}>&lt;/</span><span style={{ color: "#8be9fd" }}>head</span><span style={{ color: "#6272a4" }}>&gt;</span></div>
                <div style={{ paddingLeft: "2em" }}><span style={{ color: "#6272a4" }}>&lt;</span><span style={{ color: "#8be9fd" }}>body</span><span style={{ color: "#6272a4" }}>&gt;</span></div>
                <div style={{ paddingLeft: "4em" }}>
                  <span style={{ color: "#6272a4" }}>&lt;</span><span style={{ color: "#8be9fd" }}>h1</span><span style={{ color: "#6272a4" }}>&gt;</span>
                  <span style={{ color: "#f8f8f2", fontWeight: "bold" }}>AI Assisted</span>
                  <span style={{ color: "#6272a4" }}>&lt;/</span><span style={{ color: "#8be9fd" }}>h1</span><span style={{ color: "#6272a4" }}>&gt;</span>
                </div>
                <div style={{ paddingLeft: "2em" }}><span style={{ color: "#6272a4" }}>&lt;/</span><span style={{ color: "#8be9fd" }}>body</span><span style={{ color: "#6272a4" }}>&gt;</span></div>
                <div><span style={{ color: "#6272a4" }}>&lt;/</span><span style={{ color: "#8be9fd" }}>html</span><span style={{ color: "#6272a4" }}>&gt;</span></div>
              </div>
            </div>

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
                Your{" "}
                <span style={{ background: "linear-gradient(135deg, #5B6AD0, #8b95e8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Byte-Sized
                </span>
                <br />
                Journey to Knowledge
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
                Discover coding, algorithms, and digital skills in a fun and structured way.
                Learn at your pace, experiment, and build real projects.
              </p>
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