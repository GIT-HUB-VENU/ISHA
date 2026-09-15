import React from 'react';

export const AboutSection = () => {
  return (
    <section
      id="about-section"
      className="min-h-screen w-full px-8 md:px-20 lg:px-32 py-28 flex flex-col justify-center select-none bg-transparent text-white relative z-10"
    >
      <div className="max-w-4xl">
        {/* Subtle Section Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
          <span className="text-xs font-mono tracking-[0.3em] text-cyan-400 uppercase">
            System Specification
          </span>
        </div>

        <h2
          id="about-title"
          className="font-['Orbitron',sans-serif] text-4xl sm:text-5xl md:text-6xl font-bold tracking-[0.16em] text-white mb-8"
        >
          ABOUT I.S.H.A
        </h2>

        <p className="text-base sm:text-lg md:text-xl text-slate-300 font-light leading-relaxed tracking-wide mb-12 max-w-3xl">
          I.S.H.A (Intelligent Speech-based Human Assistant) is an offline
          intelligent speech-based human assistant designed to interact with
          the Windows desktop using natural voice commands.
        </p>

        {/* 4 Minimal Technical Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-900 pt-10">
          <div className="space-y-3">
            <h3 className="text-sm font-['Orbitron',sans-serif] tracking-[0.2em] text-slate-200 uppercase">
              01 / Offline-First Architecture
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              Designed for local, offline-first interaction. Wake-word detection,
              speech recognition, and text-to-speech execute locally on your
              hardware without transmitting voice data to cloud endpoints.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-['Orbitron',sans-serif] tracking-[0.2em] text-slate-200 uppercase">
              02 / Real-time Voice Wake-Word
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              Monitors the audio input buffer continuously for the wake word
              &quot;ISHA&quot; via openWakeWord. On detection, the robot enters
              the listening state and illuminates its electric cyan eyes.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-['Orbitron',sans-serif] tracking-[0.2em] text-slate-200 uppercase">
              03 / Desktop Automation & Files
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              Safely triggers registered desktop applications (Chrome, Brave,
              WhatsApp, Notepad, Terminal) and performs isolated file operations
              (create, read, write, append) in a protected workspace.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-['Orbitron',sans-serif] tracking-[0.2em] text-slate-200 uppercase">
              04 / 3D Character Synchrony
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              The 3D robot is synchronized with the assistant state machine. In
              idle mode, its glossy curved screen remains pure deep black. When
              listening or speaking, subtle digital expressions come alive.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
