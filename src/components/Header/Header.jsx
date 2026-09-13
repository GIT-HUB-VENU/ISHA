import React from 'react';

export const Header = ({ activeTab, onTabChange, onOpenConsole }) => {
  const handleTabClick = (tab) => {
    if (typeof onTabChange === 'function') {
      onTabChange(tab);
    }
  };

  const handleConsoleClick = () => {
    if (typeof onOpenConsole === 'function') {
      onOpenConsole();
    }
  };

  return (
    <header
      id="main-header"
      className="fixed top-0 left-0 right-0 z-40 px-8 md:px-16 py-7 flex items-center justify-between pointer-events-auto select-none"
    >
      {/* Top-Left: Robot Icon + I.S.H.A */}
      <div
        id="header-brand"
        onClick={() => handleTabClick('home')}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <div className="w-6 h-6 rounded-full border border-slate-600 flex items-center justify-center p-0.5 bg-black/40 group-hover:border-cyan-400 transition-colors duration-300">
          <svg
            className="w-4 h-4 text-slate-300 group-hover:text-cyan-400 transition-colors"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="4" y="5" width="16" height="14" rx="4" />
            <path d="M12 2v3" />
            <circle cx="9" cy="12" r="1" fill="currentColor" />
            <circle cx="15" cy="12" r="1" fill="currentColor" />
          </svg>
        </div>
        <span className="font-['Orbitron',sans-serif] text-sm md:text-base font-normal tracking-[0.28em] text-slate-200 group-hover:text-white transition-colors">
          I.S.H.A
        </span>
      </div>

      {/* Top-Right: Navigation items (Home, About, Features) */}
      <nav id="header-nav" className="flex items-center gap-8 md:gap-12">
        <button
          id="nav-item-home"
          onClick={() => handleTabClick('home')}
          className={`relative text-xs md:text-sm tracking-[0.15em] transition-colors py-1 cursor-pointer ${
            activeTab === 'home'
              ? 'text-white font-medium'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Home
          {activeTab === 'home' && (
            <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
          )}
        </button>

        <button
          id="nav-item-about"
          onClick={() => handleTabClick('about')}
          className={`relative text-xs md:text-sm tracking-[0.15em] transition-colors py-1 cursor-pointer ${
            activeTab === 'about'
              ? 'text-white font-medium'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          About
          {activeTab === 'about' && (
            <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
          )}
        </button>

        <button
          id="nav-item-features"
          onClick={() => handleTabClick('features')}
          className={`relative text-xs md:text-sm tracking-[0.15em] transition-colors py-1 cursor-pointer ${
            activeTab === 'features'
              ? 'text-white font-medium'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Features
          {activeTab === 'features' && (
            <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
          )}
        </button>

        {/* Small blue circular indicator to launch console */}
        <div
          id="nav-status-dot"
          onClick={handleConsoleClick}
          title="Voice Assistant Console"
          className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#00d8ff] cursor-pointer hover:scale-125 transition-transform"
        />
      </nav>
    </header>
  );
};
