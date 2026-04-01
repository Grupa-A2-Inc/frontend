"use client";

export default function Constellation() {
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
          {/* STEA CU 4 COLȚURI  */}
          <g id="sparkle">
            <path 
              d="M0,-10 Q0,0 10,0 Q0,0 0,10 Q0,0 -10,0 Q0,0 0,-10 Z" 
              fill="currentColor" 
            />
          </g>
          
          <style>
            {`
              /* Animație de sclipire pură (doar opacitate, fără mișcare) */
              @keyframes pure-sparkle {
                0%, 100% { opacity: 0.15; }
                50% { opacity: 1; filter: drop-shadow(0 0 6px rgba(91,106,208,0.9)); }
              }
              .star-point { 
                animation: pure-sparkle var(--duration) infinite ease-in-out;
              }
            `}
          </style>
        </defs>

        {/* Grup Constelație */}
        <g stroke="#5B6AD0" strokeWidth="1" fill="#5B6AD0" className="opacity-70 dark:opacity-50">
          
          {/* Liniile de legătură */}
          <g className="opacity-20" strokeDasharray="3 5">
            <line x1="150" y1="200" x2="280" y2="320" />
            <line x1="280" y1="320" x2="120" y2="480" />
            <line x1="120" y1="480" x2="220" y2="650" />
            <line x1="220" y1="650" x2="90" y2="800" />
            <line x1="280" y1="320" x2="380" y2="250" />
          </g>

          {/* Stelele cu 4 colțuri */}
          <use href="#sparkle" transform="translate(150, 200) scale(0.8)" className="star-point" style={{ "--duration": '3s' } as any} />
          <use href="#sparkle" transform="translate(280, 320) scale(1.2)" className="star-point" style={{ "--duration": '4s' } as any} />
          <use href="#sparkle" transform="translate(120, 480) scale(0.7)" className="star-point" style={{ "--duration": '2.5s' } as any} />
          <use href="#sparkle" transform="translate(220, 650) scale(1.1)" className="star-point" style={{ "--duration": '5s' } as any} />
          <use href="#sparkle" transform="translate(90, 800) scale(0.9)" className="star-point" style={{ "--duration": '3.5s' } as any} />
          <use href="#sparkle" transform="translate(380, 250) scale(0.6)" className="star-point" style={{ "--duration": '4.5s' } as any} />

          {/* sclipiri */}
          <use href="#sparkle" transform="translate(80, 350) scale(0.4)" className="star-point" style={{ "--duration": '2s' } as any} />
          <use href="#sparkle" transform="translate(320, 550) scale(0.5)" className="star-point" style={{ "--duration": '6s' } as any} />
          <use href="#sparkle" transform="translate(180, 780) scale(0.4)" className="star-point" style={{ "--duration": '3.2s' } as any} />
          <use href="#sparkle" transform="translate(250, 150) scale(0.3)" className="star-point" style={{ "--duration": '5.5s' } as any} />
        </g>
      </svg>
    </div>
  );
}