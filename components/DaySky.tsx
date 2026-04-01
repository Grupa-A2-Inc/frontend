"use client";

// 1. Coordonatele Y au fost mărite pentru a coborî norii pe pagină
const CLOUDS = [
  { x: 250, y: 370, s: 1.2, d: 8 },
  { x: 80,  y: 530, s: 0.8, d: 12 },
  { x: 320, y: 670, s: 1,   d: 9 },
  { x: 150, y: 870, s: 1.4, d: 14 },
  { x: 380, y: 950, s: 0.6, d: 7 },
];

// 2. Coordonatele Y mărite și pentru păsări
const BIRDS = [
  { x: 320, y: 330, s: 0.6, r: -10, d: 4 },
  { x: 360, y: 350, s: 0.4, r: -15, d: 4.5 },
  { x: 150, y: 700, s: 0.5, r: 5,   d: 5 },
];

export default function DaySky() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 1000 1000" 
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <g id="cloud">
            <path d="M15,40 A15,15 0 0,1 40,30 A20,20 0 0,1 75,35 A15,15 0 0,1 85,55 Q85,70 70,70 L15,70 Q0,70 0,55 Q0,40 15,40 Z" fill="currentColor" />
          </g>
          <g id="bird">
            <path d="M0,10 Q10,0 20,10 Q30,0 40,10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          <g id="sun">
             <circle cx="0" cy="0" r="25" fill="currentColor" />
             <circle cx="0" cy="0" r="35" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 8" />
          </g>
          
        </defs>

        <g className="text-white opacity-[0.6] drop-shadow-sm dark:opacity-0 transition-opacity duration-500">
          
          {/* Soarele */}
          <g transform="translate(120, 300)">
            <use href="#sun" className="anim-sun" />
          </g>

          {/* Norii */}
          {CLOUDS.map((cloud, i) => (
            <g key={`cloud-${i}`} transform={`translate(${cloud.x}, ${cloud.y}) scale(${cloud.s})`}>
              <use href="#cloud" className="anim-cloud" style={{ "--duration": `${cloud.d}s` } as React.CSSProperties} />
            </g>
          ))}

          {/* Păsări */}
          {BIRDS.map((bird, i) => (
            <g key={`bird-${i}`} transform={`translate(${bird.x}, ${bird.y}) scale(${bird.s}) rotate(${bird.r})`}>
              <use href="#bird" className="anim-bird" style={{ "--duration": `${bird.d}s` } as React.CSSProperties} />
            </g>
          ))}
          
        </g>
      </svg>
    </div>
  );
}