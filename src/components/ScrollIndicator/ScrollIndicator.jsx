import React from 'react';

export const ScrollIndicator = ({ onScrollClick }) => {
  const handleClick = () => {
    if (typeof onScrollClick === 'function') {
      onScrollClick();
    }
  };

  return (
    <div
      id="scroll-indicator"
      onClick={handleClick}
      className="fixed right-6 md:right-12 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-4 cursor-pointer select-none group"
      title="Scroll to explore About & Features"
    >
      <span className="text-[10px] tracking-[0.35em] text-slate-400 group-hover:text-cyan-400 transition-colors uppercase [writing-mode:vertical-lr] rotate-180 font-mono">
        SCROLL
      </span>

      <div className="relative w-[1px] h-20 bg-slate-800 flex flex-col items-center">
        {/* Animated glowing blue indicator dot traveling down the line */}
        <div className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8] group-hover:scale-125 transition-transform" />
      </div>
    </div>
  );
};
