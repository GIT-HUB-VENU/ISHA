import React from 'react';

export const FuturisticBackground = () => {
  return (
    <div
      id="futuristic-background"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black"
    >
      {/* Top-Left Subtle Technical Arc */}
      <svg
        className="absolute -top-32 -left-32 w-96 h-96 opacity-30 text-cyan-500"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle
          cx="100"
          cy="100"
          r="80"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeDasharray="4 8"
        />
        <circle
          cx="100"
          cy="100"
          r="95"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.6"
        />
      </svg>

      {/* Bottom-Right Subtle Technical Arc */}
      <svg
        className="absolute -bottom-48 -right-48 w-[32rem] h-[32rem] opacity-25 text-cyan-500"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle
          cx="100"
          cy="100"
          r="90"
          stroke="currentColor"
          strokeWidth="0.6"
        />
        <circle
          cx="100"
          cy="100"
          r="80"
          stroke="currentColor"
          strokeWidth="0.4"
          strokeDasharray="6 6"
        />
      </svg>

      {/* Faint Center-Right Ambient Glow behind Robot */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-950/15 rounded-full blur-[140px] pointer-events-none" />
    </div>
  );
};
