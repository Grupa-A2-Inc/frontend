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

const QUESTIONS = [
  {
    q: "Who creates accounts for teachers and students?",
    a: "The organization administrator creates accounts for all teachers and students. After creation, each user receives an email with a temporary password to log in.",
  },
  {
    q: "Can teachers see students from other classes?",
    a: "It depends on the teacher's scope setting. Admins can grant a teacher access to all classes or restrict them to specific ones. This controls where teachers can assign their courses.",
  },
  {
    q: "How does AI test generation work?",
    a: "Teachers select which parts of their course content the test should cover, choose the number of questions, and the AI generates multiple-choice questions instantly. Teachers then review, edit, or delete individual questions before publishing.",
  },
  {
    q: "Can students practice on their own, outside of assigned tests?",
    a: "Yes. Students can select any topic from their enrolled courses and generate a personalized practice test on demand. They can optionally set a timer for extra challenge.",
  },
  {
    q: "Is there a way to report a bad AI-generated question?",
    a: "Yes. After completing a test, students can flag any question they believe is incorrect. The report goes to the teacher for review.",
  },
  {
    q: "Can one school have multiple administrators?",
    a: "In the current MVP, each organization has one primary administrator account created at registration. Support for multiple admins is planned for a future release.",
  },
];

export default function FAQ() {
  const { ref, inView } = useInView();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-cream-alt dark:bg-cocoa px-6 md:px-10 py-24">
      <div className="max-w-[760px] mx-auto" ref={ref}>

        {/* Header */}
        <div
          className="text-center mb-12 transition-all duration-700"
          style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(24px)" }}
        >
          <span className="font-hand text-lg text-brand block mb-3">~ questions & answers ~</span>
          <h2
            className="font-display font-black text-cocoa dark:text-on-dark leading-[1.1] tracking-tight"
            style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
          >
            Frequently asked
          </h2>
        </div>

        {/* Questions */}
        <div className="flex flex-col gap-3">
          {QUESTIONS.map((item, i) => (
            <div
              key={i}
              className={`bg-cream-card dark:bg-cocoa-card rounded-2xl border overflow-hidden transition-all duration-700 ${
                open === i
                  ? "border-brand shadow-[0_4px_24px_rgba(143,96,56,0.12)]"
                  : "border-warm-border dark:border-cocoa-border"
              }`}
              style={{
                opacity: inView ? 1 : 0,
                transitionDelay: `${i * 60 + 200}ms`,
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 md:px-6 py-5 cursor-pointer bg-transparent border-none text-left"
              >
                <span className="font-display font-bold text-[15px] text-cocoa dark:text-on-dark leading-snug">
                  {item.q}
                </span>
                <span className={`text-brand text-xl font-bold shrink-0 transition-transform duration-300 ${
                  open === i ? "rotate-45" : "rotate-0"
                }`}>
                  +
                </span>
              </button>

              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                open === i ? "max-h-[300px]" : "max-h-0"
              }`}>
                <p className="px-5 md:px-6 pb-5 font-body font-semibold text-sm text-muted dark:text-muted-dark leading-relaxed">
                  {item.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
