"use client";
import { useEffect, useState } from "react";
import DoodleBackground from "@/components/DoodleBackground";

export default function Hero() {
  const [showContent, setShowContent] = useState(false);
  const [windowVisible, setWindowVisible] = useState(true);
  const [hoverClose, setHoverClose] = useState(false);
  
  const [cursorPhase, setCursorPhase] = useState<'idle' | 'moving' | 'hidden'>('idle');

  useEffect(() => {

    const tStartMove = setTimeout(() => setCursorPhase('moving'), 500);
    
    const tArrive = setTimeout(() => setHoverClose(true), 2000); 
    
    const tCloseWindow = setTimeout(() => {
      setWindowVisible(false);
      setCursorPhase('hidden');
    }, 2300);
    
    const tShowHero = setTimeout(() => setShowContent(true), 2800);
    
    return () => {
      clearTimeout(tStartMove);
      clearTimeout(tArrive);
      clearTimeout(tCloseWindow);
      clearTimeout(tShowHero);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden bg-brand-bg transition-colors duration-300">
      
      <DoodleBackground />
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-brand-primary/20 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative z-10 w-full max-w-5xl px-6">
        
        <div className="bg-[#1a2340] rounded-t-3xl border-[3px] border-brand-border shadow-2xl overflow-hidden aspect-[16/10] relative">
          
          {/* Screen inner */}
          <div className="absolute inset-0 bg-[#0f1729] flex flex-col items-center justify-center p-4 md:p-8 text-center overflow-hidden">
            
            {/* --- AI QUIZ WINDOW SIMULATION --- */}
            <div 
              className={`absolute z-20 w-full max-w-3xl bg-[#2d2d2d] rounded-2xl shadow-2xl border border-gray-700 transition-all duration-500 transform
                ${windowVisible ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}
              `}
            >
              {/* Window Header */}
              <div className="bg-[#1e1e1e] h-12 rounded-t-2xl flex items-center px-5 gap-2.5 border-b border-gray-700 relative">
                <div className={`w-4 h-4 rounded-full bg-[#ff5f56] transition-all duration-300 ${hoverClose ? "brightness-150 shadow-[0_0_12px_#ff5f56]" : ""}`} />
                <div className="w-4 h-4 rounded-full bg-[#ffbd2e]" />
                <div className="w-4 h-4 rounded-full bg-[#27c93f]" />
                <span className="absolute left-1/2 -translate-x-1/2 text-sm text-gray-400 font-mono tracking-tight">ai_test_generator.exe</span>
              </div>
              
              {/* Window Body Quiz  */}
              <div className="p-8 md:p-12 text-left font-display relative z-10">
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-4">
                  Întrebarea 5/5 (Generată de AI)
                </p>
                <h3 className="text-white text-2xl md:text-3xl font-black mb-8 leading-snug tracking-tight">
                  Cum optimizează TestifyAI procesul de învățare?
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-[#1e1e1e] border border-gray-600 rounded-xl p-5 text-gray-400 text-base font-semibold">
                    A) Oferă conținut identic tuturor studenților
                  </div>
                  {/* Correct Answer Highlighted */}
                  <div className="bg-brand-primary/20 border-2 border-brand-primary rounded-xl p-5 text-white text-base flex justify-between items-center shadow-[0_0_20px_rgba(91,106,208,0.2)]">
                    <span className="font-bold">B) Generează teste personalizate adaptate progresului</span>
                    <span className="text-brand-primary font-black text-2xl leading-none">✓</span>
                  </div>
                  <div className="bg-[#1e1e1e] border border-gray-600 rounded-xl p-5 text-gray-400 text-base font-semibold">
                    C) Necesită evaluare exclusiv manuală
                  </div>
                </div>
              </div>
            </div>
            {/* --- END QUIZ WINDOW --- */}


            {/* --- SIMULATED MOUSE CURSOR --- */}
            <div 
              className={`absolute z-50 pointer-events-none transition-all ease-out transform
                ${cursorPhase === 'idle' ? 'top-[85%] left-[80%] opacity-100' : ''}
                ${cursorPhase === 'moving' ? 'top-[5.25rem] left-[7.75rem] opacity-100 [transition:top_1.5s_ease-out,_left_1.5s_ease-out]' : ''}
                ${cursorPhase === 'hidden' ? 'top-[2rem] left-[2.5rem] scale-75 opacity-0 transition-all duration-300' : ''}
              `}
            >
              {/* Classic Pointer Arrow SVG */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg text-white">
                <path d="M4 4L11.07 20.21C11.19 20.48 11.45 20.66 11.75 20.66C12.05 20.66 12.31 20.48 12.43 20.21L14.73 14.73L20.21 12.43C20.48 12.31 20.66 12.05 20.66 11.75C20.66 11.45 20.48 11.19 20.21 11.07L4 4Z" fill="currentColor" stroke="black" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>


            {/* --- MAIN HERO CONTENT --- */}
            <div className={`transition-all duration-1000 transform ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">
                  Smart tests.
                </span>
                <br /> Limitless learning.
              </h2>
              
              <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto font-semibold mb-10 leading-relaxed">
                TestifyAI is redefining how people learn. Powered by AI, it instantly creates personalized tests, tracks your progress, and delivers exactly what you need.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {[
                  { v: "3", l: "core roles" },
                  { v: "1", l: "unified flow" },
                  { v: "AI", l: "test generation" }
                ].map((stat) => (
                  <div key={stat.l} className="bg-brand-accent/10 border border-brand-accent/30 rounded-xl py-3 px-6 flex flex-col gap-1 items-center">
                    <span className="text-2xl md:text-3xl font-black text-brand-accent">{stat.v}</span>
                    <span className="text-xs font-bold text-brand-accent/80 uppercase tracking-widest">{stat.l}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
        
        {/* Laptop Base */}
        <div className="h-4 md:h-8 bg-gradient-to-b from-[#1c2540] to-[#0f1625] rounded-b-xl md:rounded-b-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-2 bg-white/5 rounded-b-md" />
        </div>
      </div>
    </section>
  );
}