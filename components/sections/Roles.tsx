"use client";
import { useState } from "react";
import { useInView } from "@/hooks/useInView";
import Image from "next/image";

const ROLES = [
  {
    id: "01", 
    title: "Administrator",
    imageDark: "/images/admin.png",  
    imageLight: "/images/admin_l.png", 
    desc: "Creates the organization, invites users, sets up classes, and monitors activity.",
    features: ["Manage organization", "Invite members", "Oversee classes", "Analytics"],
  },
  {
    id: "02", 
    title: "Teacher",
    imageDark: "/images/teacher.png",
    imageLight: "/images/teacher_l.png",
    desc: "Designs course content, generates AI tests, and tracks student performance.",
    features: ["Build courses", "AI test generation", "Publish assessments", "Track progress"],
  },
  {
    id: "03", 
    title: "Student",
    imageDark: "/images/student.png",
    imageLight: "/images/student_l.png",
    desc: "Studies material, takes adaptive tests, gets feedback, and tracks personal progress.",
    features: ["Access content", "Take AI tests", "Instant feedback", "Monitor progress"],
  },
];

export default function Roles() {
  const [active, setActive] = useState(0);
  const { ref, inView } = useInView();

  return (
    <section className="py-24 px-6 bg-brand-mid transition-colors duration-300 overflow-hidden relative">
      <div className="max-w-6xl mx-auto relative z-10" ref={ref}>
        <div className={`text-center mb-12 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <h2 className="text-3xl md:text-5xl font-black text-brand-text mb-4">
            Built for three key roles
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {ROLES.map((r, i) => (
            <button
              key={r.id}
              onClick={() => setActive(i)}
              className={`px-8 py-3 rounded-full text-sm font-bold border transition-all duration-300 
                ${active === i 
                  ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20 scale-105" 
                  : "bg-brand-card text-brand-muted border-brand-border hover:border-brand-primary hover:text-brand-text"
                }`}
            >
              {r.title}
            </button>
          ))}
        </div>

        {/* Main Card Container */}
        <div className="bg-brand-card border border-brand-border rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            
            {/* LEFT SIDE: Traits & Content */}
            <div className="p-8 md:p-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-brand-border">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl font-black text-brand-primary/10">
                  {ROLES[active].id}
                </span>
                <h3 className="text-3xl font-bold text-brand-text">{ROLES[active].title}</h3>
              </div>
              
              <p className="text-brand-muted text-lg font-semibold mb-10 leading-relaxed">
                {ROLES[active].desc}
              </p>
              
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                {ROLES[active].features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-brand-text font-bold text-sm group">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-accent group-hover:scale-125 transition-transform" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* RIGHT SIDE: Illustrator Image */}
            <div className="relative bg-brand-bg/20 min-h-[450px] flex items-center justify-center p-12 overflow-hidden border-t lg:border-t-0 lg:border-l border-brand-border/50">
              
              {/* Glow Effect - l-am făcut puțin mai discret pe Light mode prin opacitate */}
              <div 
                key={`glow-${active}`}
                className="absolute w-64 h-64 rounded-full opacity-20 dark:opacity-30 blur-[100px] animate-pulse transition-colors duration-1000"
                style={{ 
                  backgroundColor: active === 1 ? '#0097B2' : '#5B6AD0' 
                }}
              />

              {/* 2. CONTAINER ACTUALIZAT PENTRU IMAGINI DUBLE */}
              <div 
                key={active} 
                className="relative z-10 w-[280px] h-[280px] md:w-[350px] md:h-[350px] animate-in fade-in zoom-in-95 animate-float duration-500"
              >
                
                <Image 
                  src={ROLES[active].imageLight} 
                  alt={ROLES[active].title}
                  fill
                  sizes="(max-width: 768px) 280px, 350px"
                  className="object-contain block dark:hidden filter drop-shadow-xl"
                  priority
                />

                <Image 
                  src={ROLES[active].imageDark} 
                  alt={ROLES[active].title}
                  fill
                  sizes="(max-width: 768px) 280px, 350px"
                  className="object-contain hidden dark:block filter drop-shadow-[0_0_20px_rgba(91,106,208,0.3)]"
                  priority
                />

                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-6 bg-brand-primary/10 blur-2xl rounded-[100%] pointer-events-none" />
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}