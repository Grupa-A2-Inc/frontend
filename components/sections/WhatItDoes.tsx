"use client";

const features = [
  {
    title: "AI Test Generation",
    description:
      "Teachers upload course content and the platform instantly generates relevant questions. Review, edit, and publish — no manual authoring from scratch.",
    tag: "Core Feature",
  },
  {
    title: "Visual Course Builder",
    description:
      "Build structured courses with a content tree: chapters, text resources, files, videos, and tests — all in one organized flow.",
    tag: "Builder",
  },
  {
    title: "Personalized Tests for Students",
    description:
      "Students select any topics from a course and generate a custom test on demand. They control what they practice and how many questions they get.",
    tag: "Student",
  },
  {
    title: "Progress Tracking",
    description:
      "Students see their content completion and test history per course. Teachers see enrolled students grouped by class, sortable by results.",
    tag: "Analytics",
  },
  {
    title: "Role-Based Access",
    description:
      "Admins manage the organization, teachers build and assign courses, students study and take tests. Each role sees exactly what it needs.",
    tag: "Security",
  },
  {
    title: "One Unified Flow",
    description:
      "From creating an organization to students submitting tests — the entire journey happens inside a single platform with no tool-switching.",
    tag: "Workflow",
  },
];

export default function FeaturesSection() {
  return (
    <section className="relative py-28 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_#0a1628_0%,_#020817_70%)] -z-10" />

      {}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-cyan-600/10 blur-3xl -z-10" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl -z-10" />

      <div className="max-w-6xl mx-auto">
        {}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-purple-400 border border-purple-500/30 rounded-full px-4 py-1.5 mb-6">
            CORE FEATURES
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything you need,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              nothing you don&apos;t
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            TestifyAI removes friction from learning — for admins, teachers, and students alike.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="group relative rounded-xl border border-slate-700/60 bg-slate-900/50 p-6 hover:border-slate-600 hover:bg-slate-900/80 transition-all duration-300 backdrop-blur-sm"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="absolute top-0 left-0 right-0 h-px rounded-t-xl bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="flex items-start gap-4 mb-4">
                <span className="text-m font-medium text-slate-500 mt-2 tracking-wide">
                  {feature.tag}
                </span>
              </div>

              <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-cyan-100 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}