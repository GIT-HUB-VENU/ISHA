import React, { useState, useEffect } from 'react';

const TITLE_CHARACTERS = ['I', '.', 'S', '.', 'H', '.', 'A'];

export const IntroSplash = ({ onComplete }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // Synchronize font readiness
    if (document.fonts) {
      document.fonts.ready.then(() => {
        setFontsLoaded(true);
      });
    } else {
      setFontsLoaded(true);
    }

    // Smooth fade out after sequence completes
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 3400);

    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      if (typeof onComplete === 'function') {
        onComplete();
      }
    }, 4400);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      id="intro-splash-screen"
      className={`fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center select-none overflow-hidden transition-opacity duration-1000 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Animated Cyan Circle Backdrop behind text */}
      <div className="absolute w-[360px] h-[360px] sm:w-[480px] sm:h-[480px] rounded-full border border-cyan-400/40 opacity-0 animate-cyan-circle-pulse pointer-events-none flex items-center justify-center text-cyan-400">
        <svg className="w-full h-full animate-spin-slow opacity-60" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="92" stroke="currentColor" strokeWidth="0.6" strokeDasharray="4 8" />
          <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.4" strokeDasharray="12 12" />
        </svg>
      </div>

      {/* Main Center Content Box */}
      <div
        className={`relative z-10 flex flex-col items-center text-center px-6 max-w-4xl transition-opacity duration-300 ${
          fontsLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Subtitle Above Title: Fades in first */}
        <div
          id="intro-subtitle"
          className="text-xs sm:text-sm md:text-base font-mono tracking-[0.75em] text-slate-400 font-medium uppercase mb-4 opacity-0 animate-subtitle-fade"
        >
          INTRODUCING
        </div>

        {/* Title: "I.S.H.A" (Professional & Elegant Letter-by-Letter Reveal) */}
        <h1
          id="intro-title"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
          className="text-7xl sm:text-9xl md:text-[11rem] font-bold tracking-[0.18em] text-white select-none leading-none flex items-center justify-center"
        >
          {TITLE_CHARACTERS.map((char, index) => (
            <span
              key={index}
              className="inline-block opacity-0 animate-letter-reveal"
              style={{ animationDelay: `${1.0 + index * 0.14}s` }}
            >
              {char}
            </span>
          ))}
        </h1>
      </div>
    </div>
  );
};
