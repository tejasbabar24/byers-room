
import React from 'react';

interface ControlsProps {
  gameState: 'IDLE' | 'PLAYING' | 'PAUSED' | 'FINISHED';
  onStart: () => void;
  onTogglePause: () => void;
  onRepeat: () => void;
  onShowAnswer: () => void;
}

const Controls: React.FC<ControlsProps> = ({ 
  gameState, 
  onStart, 
  onTogglePause, 
  onRepeat, 
  onShowAnswer 
}) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <button 
        onClick={onStart}
        className="px-6 py-3 bg-red-900/40 hover:bg-red-800/60 text-white rounded-full font-bold transition-all flex items-center gap-2 border border-red-500/30 backdrop-blur-sm group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-125 transition-transform" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
        NEXT SIGNAL
      </button>

      {gameState !== 'IDLE' && (
        <>
          <button 
            onClick={onTogglePause}
            className="px-6 py-3 bg-zinc-900/60 hover:bg-zinc-800/80 text-white rounded-full font-bold transition-all flex items-center gap-2 border border-white/10"
          >
            {gameState === 'PAUSED' ? (
              <><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> RESUME</>
            ) : (
              <><span className="w-2 h-2 rounded-full bg-yellow-500" /> PAUSE</>
            )}
          </button>

          <button 
            onClick={onRepeat}
            className="px-6 py-3 bg-zinc-900/60 hover:bg-zinc-800/80 text-white rounded-full font-bold transition-all flex items-center gap-2 border border-white/10 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            REPEAT
          </button>

          <button 
            onClick={onShowAnswer}
            className="px-6 py-3 bg-zinc-900/60 hover:bg-zinc-800/80 text-white rounded-full font-bold transition-all flex items-center gap-2 border border-white/10 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            REVEAL
          </button>
        </>
      )}
    </div>
  );
};

export default Controls;
