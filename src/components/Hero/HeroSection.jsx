import React from 'react';

export const HeroSection = ({
  isMicActive,
  onToggleMic,
  lastUserRequest,
  lastSpeechFeedback,
  assistantState,
}) => {
  const isListeningMode = assistantState === 'LISTENING' || assistantState === 'WAKE_DETECTED';

  return (
    <div
      id="hero-left-section"
      className="flex flex-col justify-center max-w-2xl z-10 select-none pl-4 md:pl-8 lg:pl-16"
    >
      {/* Massive I.S.H.A Title */}
      <h1
        id="hero-title"
        className="font-['Orbitron',sans-serif] text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-normal tracking-[0.22em] text-white leading-none mb-6 drop-shadow-[0_0_24px_rgba(255,255,255,0.12)]"
      >
        I.S.H.A
      </h1>

      {/* Sub-headline: INTELLIGENT • SMART • HELPFUL • ALWAYS */}
      <div
        id="hero-subheadline"
        className="flex items-center flex-wrap gap-2 md:gap-3 text-[11px] sm:text-xs md:text-sm tracking-[0.38em] text-slate-400 font-['Rajdhani',sans-serif] font-medium uppercase mb-6"
      >
        <span>INTELLIGENT</span>
        <span className="text-cyan-400 font-bold">•</span>
        <span>SPEECH-BASED</span>
        <span className="text-cyan-400 font-bold">•</span>
        <span>HUMAN</span>
        <span className="text-cyan-400 font-bold">•</span>
        <span>ASSISTANT</span>
      </div>

      {/* Technical Line + "Your Offline AI Companion" */}
      <div id="hero-tagline" className="flex items-center gap-4 mb-6">
        <div className="w-12 md:w-20 h-[1px] bg-gradient-to-r from-slate-600 to-cyan-400" />
        <p className="text-xs sm:text-sm md:text-base text-slate-300 tracking-[0.18em] font-light">
          OFFLINE PARTNER
        </p>
      </div>

      {/* Dynamic Active Request & Response Panel (Displayed directly below title) */}
      {(lastUserRequest || lastSpeechFeedback || isListeningMode) && (
        <div
          id="active-speech-response-panel"
          className="mb-6 p-4 rounded-xl bg-slate-950/90 border border-cyan-500/40 backdrop-blur-md max-w-lg shadow-[0_0_25px_rgba(34,211,238,0.15)] font-mono text-xs select-text animate-fade-in"
        >
          {/* Recognized User Request */}
          {lastUserRequest && (
            <div className="flex items-start gap-2 text-slate-200 mb-2">
              <span className="text-cyan-400 font-bold tracking-wider shrink-0">YOU:</span>
              <span className="text-slate-100 font-medium">&quot;{lastUserRequest}&quot;</span>
            </div>
          )}

          {/* Real-time Listening Command Indicator */}
          {isListeningMode && !lastSpeechFeedback && (
            <div className="flex items-center gap-2 text-cyan-300 animate-pulse my-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Listening... Speak command (e.g., &quot;open calculator&quot;)</span>
            </div>
          )}

          {/* ISHA Active Reply */}
          {lastSpeechFeedback && (
            <div className="flex items-start gap-2 pt-2 border-t border-slate-800 text-cyan-300">
              <span className="text-cyan-400 font-bold tracking-wider shrink-0">ISHA:</span>
              <span className="leading-relaxed">&quot;{lastSpeechFeedback}&quot;</span>
            </div>
          )}
        </div>
      )}

      {/* Voice Wake-Word Activation Trigger */}
      <div
        onClick={onToggleMic}
        className="mt-4 inline-flex items-center gap-3 px-4 py-2.5 bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 rounded-full cursor-pointer transition-all duration-300 group max-w-fit"
        title="Click to toggle continuous voice recognition"
      >
        <span
          className={`inline-block w-2 h-2 rounded-full ${isMicActive
            ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-ping'
            : 'bg-slate-500 group-hover:bg-cyan-400'
            }`}
        />
        <span className="text-xs text-slate-300 group-hover:text-cyan-300 font-mono tracking-wider">
          {isMicActive
            ? 'LISTENING CONTINUOUSLY — SAY "ISHA" TO ACTIVATE'
            : 'CLICK HERE TO ACTIVATE VOICE & WAKE-WORD DETECTOR'}
        </span>
      </div>
    </div>
  );
};
