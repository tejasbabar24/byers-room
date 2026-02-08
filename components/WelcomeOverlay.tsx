
import React from 'react';

interface WelcomeOverlayProps {
  onStart: () => void;
  isLoading?: boolean;
}

const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ onStart, isLoading }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-1000">
      <div className="bg-black/80 p-12 rounded-3xl border border-white/5 backdrop-blur-xl shadow-2xl max-w-2xl transform transition-all hover:scale-[1.01]">
        <h1 className="text-6xl md:text-8xl font-black text-red-600 uppercase tracking-tighter special-elite mb-2 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">
          WELCOME TO THE<br />BYERS ROOM
        </h1>
        <p className="text-zinc-400 text-xl md:text-2xl font-serif italic tracking-widest mt-4">
          A Stranger Things Experience
        </p>
        
        <div className="mt-12 flex flex-col items-center gap-6">
          <button 
            onClick={onStart}
            disabled={isLoading}
            className="group relative flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-10 py-4 rounded-full text-xl font-bold transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg shadow-red-900/40 disabled:opacity-50 disabled:scale-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isLoading ? 'animate-pulse' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
            {isLoading ? 'Listening to the Void...' : 'Talk to Will'}
          </button>
          
          <div className="flex items-center gap-3 bg-zinc-900/90 border border-white/5 px-6 py-2 rounded-full">
            <div className={`w-4 h-4 rounded-full border-2 border-green-500 border-t-transparent ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-zinc-400 font-mono text-sm tracking-widest uppercase">
              {isLoading ? 'Connecting to the Upside Down' : 'Servers Ready'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-zinc-600 text-xs font-mono uppercase tracking-[0.3em]">
        Made with Stranger Tech
      </div>
    </div>
  );
};

export default WelcomeOverlay;
