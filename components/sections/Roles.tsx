"use client";

import { useState } from "react";

const roles = [
  {
    id: "01",
    title: "Administrator",
    subtitle: "Full control over the organization",
    description:
      "Creates and manages the organization, invites teachers and students, sets up classes, and monitors overall activity across the platform.",
    features: [
      "Create & manage organization",
      "Invite teachers and students",
      "Oversee classes and courses",
      "View platform-wide analytics",
    ],
    color: "cyan",
  },
  {
    id: "02",
    title: "Teacher",
    subtitle: "Build and publish courses",
    description:
      "Designs course content visually, generates AI-powered tests from course material, reviews them before publishing, and tracks student performance.",
    features: [
      "Build courses visually",
      "AI-generate tests from content",
      "Edit & publish assessments",
      "Track student progress",
    ],
    color: "purple",
  },
  {
    id: "03",
    title: "Student",
    subtitle: "Learn, test, and improve",
    description:
      "Studies the course material, takes adaptive tests, receives instant feedback, and tracks their own learning progress over time.",
    features: [
      "Access course content",
      "Take AI-generated tests",
      "Get instant feedback",
      "Monitor personal progress",
    ],
    color: "teal",
  },
];

const colorMap: Record<string, { accent: string; border: string; glow: string; bg: string }> = {
  cyan: {
    accent: "text-cyan-400",
    border: "border-cyan-500/40",
    glow: "shadow-cyan-500/20",
    bg: "bg-cyan-500/10",
  },
  purple: {
    accent: "text-purple-400",
    border: "border-purple-500/40",
    glow: "shadow-purple-500/20",
    bg: "bg-purple-500/10",
  },
  teal: {
    accent: "text-teal-400",
    border: "border-teal-500/40",
    glow: "shadow-teal-500/20",
    bg: "bg-teal-500/10",
  },
};

export default function RolesSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="relative py-28 px-6 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0f172a_0%,_#020817_60%)] -z-10" />
      <div
        className="absolute inset-0 -z-10 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(6,182,212,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.08) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-cyan-400 border border-cyan-500/30 rounded-full px-4 py-1.5 mb-6">
            WHO IT&apos;S FOR
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Three roles,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              one platform
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            TestifyAI is built around a clear structure. Each role has distinct
            responsibilities and a tailored experience.
          </p>
        </div>

        {/* Tab selector */}
        <div className="flex justify-center gap-2 mb-12">
          {roles.map((role, i) => {
            const c = colorMap[role.color];
            return (
              <button
                key={role.id}
                onClick={() => setActive(i)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-300 ${
                  active === i
                    ? `${c.border} ${c.bg} ${c.accent} shadow-lg ${c.glow}`
                    : "border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500"
                }`}
              >
                {role.title}
              </button>
            );
          })}
        </div>

        {/* Card */}
        <div className="max-w-3xl mx-auto">
          {roles.map((role, i) => {
            const c = colorMap[role.color];
            if (i !== active) return null;
            return (
              <div
                key={role.id}
                className={`rounded-2xl border ${c.border} ${c.bg} p-8 md:p-12 shadow-2xl ${c.glow} transition-all duration-300`}
              >
                <div className="flex items-start gap-6 mb-8">
                  <span className={`text-5xl font-black ${c.accent} opacity-30 leading-none`}>
                    {role.id}
                  </span>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{role.title}</h3>
                    <p className={`text-sm font-medium ${c.accent} mt-1`}>{role.subtitle}</p>
                  </div>
                </div>
                <p className="text-slate-300 text-base leading-relaxed mb-8">{role.description}</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {role.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-slate-300 text-sm">
                      <span className={`w-1.5 h-1.5 rounded-full ${c.accent} bg-current flex-shrink-0`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}