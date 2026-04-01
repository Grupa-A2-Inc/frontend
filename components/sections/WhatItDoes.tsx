"use client";
import { useInView } from "@/hooks/useInView";
import DoodleBackground from "@/components/DoodleBackground";

const FEATURES = [
  { title: "AI Test Generation", desc: "Upload course content and instantly generate relevant questions. No manual authoring from scratch.", tag: "Core" },
  { title: "Visual Course Builder", desc: "Build structured courses with chapters, text, files, and videos in one flow.", tag: "Builder" },
  { title: "Personalized Tests", desc: "Students generate custom tests on demand to practice exactly what they need.", tag: "Student" },
  { title: "Progress Tracking", desc: "See content completion and history. Teachers see enrolled students grouped by class.", tag: "Analytics" },
  { title: "Role-Based Access", desc: "Admins manage, teachers build, students learn. Each role sees what it needs.", tag: "Security" },
  { title: "Unified Flow", desc: "The entire journey happens inside a single platform with no tool-switching.", tag: "Workflow" },
];

export default function WhatItDoes() {
  const { ref, inView } = useInView();

  return (
    <section className="py-24 px-6 bg-brand-bg relative overflow-hidden transition-colors duration-300">
      
      <DoodleBackground />

      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-accent/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-brand-primary/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10" ref={ref}>
        <div className={`text-center mb-16 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <span className="font-mono text-xs font-bold tracking-[0.2em] text-brand-primary uppercase bg-brand-primary/10 px-4 py-1.5 rounded-full border border-brand-primary/20">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-brand-text mt-6 mb-4">
            Everything you need
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div 
              key={f.title} 
              className={`group bg-brand-card/50 backdrop-blur-sm border border-brand-border p-8 rounded-2xl hover:border-brand-primary/50 hover:bg-brand-card transition-all duration-300
                ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
              `}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <span className="text-xs font-bold uppercase tracking-wider text-brand-accent bg-brand-accent/10 px-3 py-1 rounded-md mb-4 inline-block">
                {f.tag}
              </span>
              <h3 className="text-xl font-bold text-brand-text mb-3 group-hover:text-brand-primary transition-colors">
                {f.title}
              </h3>
              <p className="text-brand-muted text-sm font-semibold leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}