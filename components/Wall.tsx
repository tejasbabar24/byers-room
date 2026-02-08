
import React from 'react';
import { WALL_LAYOUT, LIGHT_COLORS } from '../constants';

interface WallProps {
  activeLetter: string | null;
}

const Wall: React.FC<WallProps> = ({ activeLetter }) => {
  const getLightColor = (letter: string) => {
    const charCode = letter.charCodeAt(0);
    return LIGHT_COLORS[charCode % LIGHT_COLORS.length];
  };

  // Pseudo-random rotation for hand-painted look based on character code
  const getRotation = (letter: string) => {
    const charCode = letter.charCodeAt(0);
    return (charCode % 14) - 7; // -7 to +6 degrees (slightly larger hand-painted tilt)
  };

  const getOffset = (letter: string) => {
    const charCode = letter.charCodeAt(0);
    return (charCode % 37) - 18; // -18 to +18 pixels (wider horizontal spread)
  };

  const getOffsetY = (letter: string) => {
    const charCode = letter.charCodeAt(0);
    return (charCode % 9) - 4; // -4 to +4 pixels vertical jitter
  };

  return (
    <div className="relative w-full space-y-8 md:space-y-12 py-8 flex flex-col items-center select-none">
      {WALL_LAYOUT.map((row, rowIndex) => (
        <div 
          key={rowIndex}
          className="flex flex-wrap justify-center gap-x-12 gap-y-10 md:gap-x-16 md:gap-y-12 px-2 w-full"
        >
          {row.map((letter, colIndex) => {
            const isActive = activeLetter === letter;
            const color = getLightColor(letter);
            const rotation = getRotation(letter);
            const offsetX = getOffset(letter);
            const offsetY = getOffsetY(letter);

            const backdropId = `alphabet-${rowIndex}-${colIndex}-${letter}`;

            return (
              <div 
                key={`${rowIndex}-${colIndex}-${letter}`} 
                className="relative flex flex-col items-center"
                style={{ transform: `translate(${offsetX}px, ${offsetY}px)` }}
              >
                {/* Visual String Segment */}
                <div className="absolute -top-4 w-[1px] h-5 bg-zinc-800" />
                
                {/* Light Bulb - Improved Detail */}
                <div className="relative mb-3 group">
                  {/* Socket */}
                  <div className="absolute -top-1 left-1/2 z-10 -translate-x-1/2 w-4 h-2 bg-zinc-900 rounded-sm" />
                  
                  {/* Glass Bulb */}
                  <div
                    className={`
                      z-8 w-3 h-4 md:w-4 md:h-6 rounded-full light-glow relative overflow-hidden
                      ${isActive ? 'scale-105' : 'opacity-50 grayscale-[0.2]'}
                      transition-all duration-300 ease-out
                    `}
                    style={{
                      backgroundColor: isActive ? color : '#f0efef',
                      boxShadow: isActive ? `0 0 20px 6px ${color}, inset 0 0 4px rgba(255,255,255,0.35)` : 'none'
                    }}
                  >
                    {/* Filament Detail */}
                    {isActive && <div className="absolute inset-0 flex items-center justify-center opacity-40"><div className="w-[2px] h-3 bg-white rounded-full blur-[1px]" /></div>}
                  </div>
                </div>
                
                {/* Backdrop: subtle glowing patch on the wall behind each letter */}
                <div
                  id={backdropId}
                  className={`absolute -z-10 left-1/2 -translate-x-1/2 transition-all duration-300 rounded-full`}
                  style={{
                    width: '4rem',
                    height: '5rem',
                    top: '0.6rem',
                    backgroundColor: isActive ? `${color}50` : 'transparent',
                    boxShadow: isActive ? `0 8px 30px ${color}55` : 'none',
                    filter: isActive ? 'blur(4px)' : 'none',
                    transform: `translateX(-50%) scale(${isActive ? 1.05 : 0.95})`
                  }}
                />

                {/* Letter - Hand Painted Look (painted on wall; always solid black) */}
                <span
                  className={`
                    text-5xl md:text-5xl font-bold special-elite alphabet-font
                    transition-all duration-300
                  `}
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    color: '#000',
                    textShadow: 'none',
                    filter: 'none'
                  }}
                >
                  {letter}
                </span>
              </div>
            );
          })}
        </div>
      ))}
      
      {/* Wire System (Improved Visuals) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" style={{ zIndex: -1 }}>
        <filter id="shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.5"/>
        </filter>
        <path
          d="M-50,110 C300,90 600,140 960,110 S1600,80 1970,110"
          fill="none" stroke="#0a0a0a" strokeWidth="2" filter="url(#shadow)"
        />
        <path
          d="M-50,330 C300,310 600,360 960,330 S1600,300 1970,330"
          fill="none" stroke="#0a0a0a" strokeWidth="2" filter="url(#shadow)"
        />
        <path
          d="M-50,560 C300,540 600,590 960,560 S1600,530 1970,560"
          fill="none" stroke="#0a0a0a" strokeWidth="2" filter="url(#shadow)"
        />
      </svg>
    </div>
  );
};

export default Wall;
