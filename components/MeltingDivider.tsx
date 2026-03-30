"use client";

interface MeltingDividerProps {
  fromClass: string;
  toClass: string;   
}
export default function MeltingDivider({
  fromClass,
  toClass
}: MeltingDividerProps) {
  
  const drops = [
    { left: "3%", duration: "4.5s", delay: "0.1s", h: "h-16" },
    { left: "9%", duration: "3.2s", delay: "1.8s", h: "h-20" },
    { left: "15%", duration: "5.8s", delay: "0.5s", h: "h-12" },
    { left: "22%", duration: "4.4s", delay: "2.1s", h: "h-24" },
    { left: "28%", duration: "3.6s", delay: "1.2s", h: "h-16" },
    { left: "35%", duration: "5.3s", delay: "0.9s", h: "h-20" },
    { left: "42%", duration: "4.7s", delay: "3.2s", h: "h-14" },
    { left: "48%", duration: "3.5s", delay: "0.7s", h: "h-24" },
    { left: "55%", duration: "5.2s", delay: "2.4s", h: "h-16" },
    { left: "61%", duration: "4.8s", delay: "1.0s", h: "h-20" },
    { left: "68%", duration: "3.4s", delay: "2.8s", h: "h-12" },
    { left: "75%", duration: "4.6s", delay: "0.3s", h: "h-24" },
    { left: "82%", duration: "5.5s", delay: "1.7s", h: "h-16" },
    { left: "88%", duration: "3.9s", delay: "2.5s", h: "h-20" },
    { left: "94%", duration: "4.2s", delay: "0.8s", h: "h-14" },
  ];

  return (
    
    <div className={`relative w-full h-32 md:h-40 overflow-hidden bg-gradient-to-b ${fromClass} ${toClass}`}>
      {drops.map((drop, i) => (
        <div
          key={i}
          className={`absolute -top-24 w-[1.5px] ${drop.h} animate-rain bg-gradient-to-b from-transparent to-brand-text/20`}
          style={{
            left: drop.left,
            animationDuration: drop.duration,
            animationDelay: drop.delay,
          }}
        />
      ))}
    </div>
  );
}
