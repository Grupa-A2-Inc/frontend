"use client";
import { useState } from "react";
import { useInView } from "@/hooks/useInView";
import Image from "next/image";
import Constellation from "../Constellation";
import DaySky from "../DaySky";

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  { q: "Who can use TestifyAI?", a: "TestifyAI is built for administrators, teachers and students. Each has dedicated flows." },
  { q: "How is an organization created?", a: "Created from the register flow. The creator automatically becomes the first administrator." },
  { q: "Do students create their accounts?", a: "No. Teacher and student accounts are managed by the administrator." },
  { q: "How are tests generated?", a: "Teachers generate tests with AI based on content, review them, and publish." },
  { q: "Can students generate personalized tests?", a: "Yes. Students can select topics from a course and generate personalized tests to practice specific content they want to review." },
  { q: "Can courses be assigned to classes?", a: "Yes. Courses can be assigned according to the teacher's allowed scope, so content reaches the right classes and students in an organized way." },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { ref, inView } = useInView();

  return (
    <section className="py-24 px-6 bg-brand-bg transition-colors duration-300 relative overflow-hidden" id="faq">
      
      {/* --- CONSTELAȚIA --- */}
      <div className="hidden dark:block">
        <Constellation />
      </div>
      {/* --- NORII --- */}
      <div className="block dark:hidden"> {/* Corectat: era 'hidden dark:hidden' */}
        <DaySky />
      </div>

      {/* --- Planeta --- */}
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] md:w-[700px] md:h-[700px] pointer-events-none select-none z-0 opacity-80 dark:opacity-90">
        
        {/* Glow */}
        <div className="absolute inset-0 bg-brand-primary/20 blur-[120px] rounded-full transform translate-x-1/4 translate-y-1/4" />
        
        <div className="relative w-full h-full">
          
          {/* Pământ */}
          <Image 
            src="/images/earth-detail.png" 
            alt="Earth Decoration"
            fill
            sizes="(max-width: 768px) 500px, 700px" 
            className="object-contain block dark:hidden drop-shadow-2xl"
            priority
          />

          {/* Luna */}
          <Image 
            src="/images/moon-detail.png" 
            alt="Moon Decoration"
            fill
            sizes="(max-width: 768px) 500px, 700px" 
            className="object-contain hidden dark:block grayscale contrast-[1.1] brightness-[0.8]"
            priority
          />

          {/* Mască de gradient*/}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-transparent opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-l from-brand-bg via-transparent to-transparent opacity-40" />
        </div>
      </div>
      

      <div className="max-w-3xl mx-auto relative z-10" ref={ref}>
        <div className={`text-center mb-16 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <h2 className="text-4xl font-black text-brand-text mb-4">Frequently Asked Questions</h2>
        </div>

        <div className="flex flex-col gap-4">
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div 
                key={i} 
                className={`border rounded-2xl overflow-hidden transition-all duration-300 backdrop-blur-sm
                  ${isOpen ? "bg-brand-mid/80 border-brand-primary shadow-md shadow-brand-primary/10" : "bg-brand-card/60 border-brand-border"}`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className={`font-bold text-lg transition-colors ${isOpen ? "text-brand-text" : "text-brand-muted"}`}>
                    {item.q}
                  </span>
                  <span className={`flex items-center justify-center w-8 h-8 rounded-full font-black text-xl transition-colors
                    ${isOpen ? "bg-brand-primary/20 text-brand-primary" : "bg-brand-accent/10 text-brand-accent"}`}>
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                
                <div 
                  className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <div className="p-6 pt-0 text-brand-muted font-semibold leading-relaxed border-t border-brand-border/50 mx-6 mt-2">
                    {item.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}