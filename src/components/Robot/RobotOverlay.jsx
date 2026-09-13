import React from 'react';

export const RobotOverlay = ({ isHovered }) => {
  return (
    <div
      id="robot-hover-prompt"
      className="absolute top-4 sm:top-6 right-6 sm:right-14 md:right-20 z-20 pointer-events-none select-none flex flex-col items-end transition-opacity duration-500"
      style={{ opacity: isHovered ? 0.35 : 1.0 }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#38bdf8]" />
        <span className="text-xs md:text-sm tracking-[0.18em] text-slate-300 font-light">
          Hover me...
        </span>
      </div>

      {/* Curved Technical Arrow pointing toward the 3D robot */}
      <svg
        className="w-12 h-10 text-slate-400/80 -mr-2"
        viewBox="0 0 60 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M50,4 C35,4 12,12 10,34" />
        <polyline points="4,26 10,34 18,28" />
      </svg>
    </div>
  );
};
