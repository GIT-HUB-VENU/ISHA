import React from 'react';

const FEATURES = [
  {
    num: '01',
    name: 'Wake Word Detection',
    desc: 'Local wake-word engine continuously monitoring for "ISHA" with zero cloud dependency.',
    tech: 'openWakeWord / Audio Stream',
  },
  {
    num: '02',
    name: 'Offline Speech Recognition',
    desc: 'Converts voice commands into structured text with low-latency local phonetic models.',
    tech: 'Vosk Offline ASR',
  },
  {
    num: '03',
    name: 'Application Launching',
    desc: 'Launches WhatsApp, Chrome, Brave, Notepad, Calculator, Terminal, and File Explorer.',
    tech: 'Safe Application Registry',
  },
  {
    num: '04',
    name: 'Workspace File Operations',
    desc: 'Dedicated voice intents to create, read, write, and append files inside isha_workspace.',
    tech: 'Sandboxed File Controller',
  },
  {
    num: '05',
    name: 'Local AI Intelligence',
    desc: 'Conversational comprehension and query answering powered by local open LLMs.',
    tech: 'Ollama / Llama 3.2',
  },
  {
    num: '06',
    name: 'Neural Text-to-Speech',
    desc: 'Fast, natural-sounding voice feedback synthesized directly on local CPU/GPU.',
    tech: 'Piper TTS Engine',
  },
  {
    num: '07',
    name: 'Windows Automation',
    desc: 'Subprocess and desktop controls with strict validation against destructive operations.',
    tech: 'Python Automation Core',
  },
  {
    num: '08',
    name: 'Real-time 3D Robot Synchrony',
    desc: 'Interactive 3D WebGL character responding to cursor tracking, rotation, and voice states.',
    tech: 'Three.js / WebGL Rig',
  },
];

export const FeaturesSection = () => {
  return (
    <section
      id="features-section"
      className="min-h-screen w-full px-8 md:px-20 lg:px-32 py-28 flex flex-col justify-center select-none bg-transparent text-white relative z-10 border-t border-slate-900/60"
    >
      <div className="max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
          <span className="text-xs font-mono tracking-[0.3em] text-cyan-400 uppercase">
            Capabilities Matrix
          </span>
        </div>

        <h2
          id="features-title"
          className="font-['Orbitron',sans-serif] text-4xl sm:text-5xl md:text-6xl font-bold tracking-[0.16em] text-white mb-14"
        >
          CORE FEATURES
        </h2>

        {/* Minimal technical grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feat) => (
            <div
              key={feat.num}
              className="p-6 border border-slate-900 bg-black/40 hover:border-cyan-500/40 transition-colors group relative"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-mono text-cyan-400/80 tracking-widest">
                  {feat.num}
                </span>
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  {feat.tech}
                </span>
              </div>
              <h3 className="text-sm font-['Orbitron',sans-serif] tracking-wider text-slate-100 mb-2 group-hover:text-cyan-300 transition-colors">
                {feat.name}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
