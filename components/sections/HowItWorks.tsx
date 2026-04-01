"use client";
import { useEffect, useState } from "react";
import { useInView } from "@/hooks/useInView";

const STEPS = [
  { step: "01", title: "Create organization", desc: "User becomes the first admin automatically." },
  { step: "02", title: "Configure platform", desc: "Admin adds teachers, students and classes." },
  { step: "03", title: "Build courses", desc: "Generate AI tests and structure learning." },
  { step: "04", title: "Study & practice", desc: "Take tests and track real-time progress." },
];

export default function HowItWorks() {
  const { ref, inView } = useInView();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => setActiveStep(v => (v + 1) % STEPS.length), 3000);
    return () => clearInterval(t);
  }, [inView]);

  return (
    <section id="how-it-works" className="bg-brand-mid py-24 px-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto" ref={ref}>
        
        <div className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <span className="font-mono text-xs font-bold tracking-[0.2em] text-brand-primary uppercase bg-brand-primary/10 px-4 py-1.5 rounded-full border border-brand-primary/20">
            How it works
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-brand-text mt-6 mb-4 leading-tight">
            A simple flow,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">
              from setup to progress
            </span>
          </h2>
          <p className="text-brand-muted text-lg font-semibold">
            The platform is designed as a clear path for admins, teachers, and students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s, i) => {
            const isActive = activeStep === i;
            return (
              <div 
                key={s.step}
                onClick={() => setActiveStep(i)}
                className={`relative p-8 rounded-2xl cursor-pointer border transition-all duration-500 overflow-hidden
                  ${isActive 
                    ? "bg-brand-card border-brand-primary shadow-[0_0_30px_rgba(91,106,208,0.15)] scale-[1.02]" 
                    : "bg-transparent border-brand-border hover:bg-brand-card hover:border-brand-border"
                  }
                  ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
                `}
                style={{ transitionDelay: `${inView ? i * 150 : 0}ms` }}
              >
                {/* Top glow line */}
                <div className={`absolute top-0 left-0 w-full h-1 transition-all duration-500 ${isActive ? "bg-gradient-to-r from-brand-primary to-brand-accent" : "bg-transparent"}`} />
                
                <span className={`font-mono text-sm font-bold tracking-widest transition-colors ${isActive ? "text-brand-accent" : "text-brand-muted"}`}>
                  {s.step}
                </span>
                <h3 className={`text-xl font-bold mt-4 mb-2 transition-colors ${isActive ? "text-brand-text" : "text-brand-muted"}`}>
                  {s.title}
                </h3>
                <p className="text-sm text-brand-muted font-medium leading-relaxed">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}