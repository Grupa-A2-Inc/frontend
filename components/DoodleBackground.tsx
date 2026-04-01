"use client";

export default function DoodleBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.2] dark:opacity-[0.2]">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="doodle-pattern"
            width="600"
            height="600"
            patternUnits="userSpaceOnUse"
          >
            {/* === STILUL GLOBAL === */}
            <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              
              {/* ELEMENTE COMUNE */}
              
              {/* Ecuația */}
              <text 
                x="380" y="120" 
                fontSize="18" 
                fill="currentColor" 
                stroke="none" 
                className="font-mono opacity-80"
                style={{ transform: 'rotate(10deg)', fontFamily: 'var(--font-fira-code)' }}
              >
                a² + b² = c²
              </text>

              {/* Echer / Riglă */}
              <g transform="translate(100, 450) rotate(5)">
                <path d="M0 0 L0 80 L80 80 Z" />
                <path d="M8 10 v10 M8 30 v10 M8 50 v10 M20 72 h10 M40 72 h10" />
              </g>

              {/* Becul */}
              <g transform="translate(500, 320) rotate(-10) scale(0.8)">
                <path d="M0 0 C-15 -10 -20 -25 -20 -35 A20 20 0 1 1 20 -35 C20 -25 15 -10 0 0" />
                <path d="M-7 5 L7 5 M-5 10 L5 10" />
                <circle cx="0" cy="-35" r="5" className="opacity-40" />
              </g>

              {/* Compas */}
              <g transform="translate(320, 480) rotate(20) scale(0.9)">
                <path d="M0 0 L-12 45 M0 0 L12 45 M-4 0 A4 4 0 1 1 4 0" />
                <path d="M-8 28 L8 28" />
              </g>

              {/* Puncte, cruciulițe */}
              <circle cx="250" cy="250" r="3" fill="currentColor" stroke="none" />
              <path d="M450 450 l6 6 M456 450 l-6 6" /> 
              <circle cx="50" cy="300" r="1.5" fill="currentColor" stroke="none" />
              <path d="M400 200 A 150 150 0 0 1 550 350" className="opacity-20" />


              {/* ELEMENTE PENTRU NOAPTE */}
              <g className="hidden dark:block">
                
                {/* Steluța cu inel (Sus Stânga) */}
                <g transform="translate(80, 100) rotate(-15)">
                  <path d="M0 -15 L4 -4 L15 0 L4 4 L0 15 L-4 4 L-15 0 L-4 -4 Z" />
                  <ellipse cx="0" cy="0" rx="22" ry="8" transform="rotate(-20)" />
                </g>

                {/* Steluțe */}
                <path d="M150 200 l0 8 M146 204 l8 0" /> 
                <circle cx="520" cy="80" r="2" fill="currentColor" stroke="none" />
              </g>

              {/* ELEMENTE PENTRU ZI */}
              <g className="block dark:hidden">
                
                {/* Norișor 1 (În locul steluței din stânga sus) */}
                <g transform="translate(60, 80) scale(1.1)">
                  <path d="M10,20 C10,10 25,10 25,15 C30,5 50,5 50,20 C60,20 60,35 50,35 L15,35 C5,35 5,20 10,20 Z" />
                </g>

                {/* Soare (Dreapta Sus) */}
                <g transform="translate(520, 90) scale(0.8)">
                  <circle cx="0" cy="0" r="15" />
                  <path d="M0,-22 v-8 M0,22 v8 M-22,0 h-8 M22,0 h8 M-15,-15 l-6,-6 M15,15 l6,6 M-15,15 l-6,6 M15,-15 l6,-6" />
                </g>

                {/* Avion de hârtie (Stânga Mijloc) - Simbolizează cunoașterea în mișcare */}
                <g transform="translate(70, 250) rotate(15)">
                  <path d="M0,0 L30,-10 L10,15 Z M10,15 L15,25 L18,12" />
                  {/* Traseul avionului punctat */}
                  <path d="M-15,-5 L-25,-2 M-35,1 L-45,5" strokeDasharray="2 3" className="opacity-50" />
                </g>

                {/* Norișor 2 mai mic (Dreapta Jos) */}
                <g transform="translate(480, 500) scale(0.7) rotate(-5)">
                  <path d="M10,20 C10,10 25,10 25,15 C30,5 50,5 50,20 C60,20 60,35 50,35 L15,35 C5,35 5,20 10,20 Z" />
                </g>

              </g>

            </g>
          </pattern>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#doodle-pattern)" />
      </svg>
    </div>
  );
}