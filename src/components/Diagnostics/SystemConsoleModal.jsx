import React, { useState, useEffect } from 'react';
import { ASSISTANT_STATES } from '../../constants/assistant';

export const SystemConsoleModal = ({
  isOpen,
  onClose,
  currentState,
  onStateChange,
  onRunTestCommand,
}) => {
  const [inputCmd, setInputCmd] = useState('');

  // Keyboard Escape listener fix
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    if (!inputCmd.trim()) return;
    onRunTestCommand(inputCmd.trim());
    setInputCmd('');
  };

  const stateOptions = [
    ASSISTANT_STATES.IDLE,
    ASSISTANT_STATES.WAKE_DETECTED,
    ASSISTANT_STATES.LISTENING,
    ASSISTANT_STATES.PROCESSING,
    ASSISTANT_STATES.SPEAKING,
    ASSISTANT_STATES.ERROR,
  ];

  return (
    <div
      id="system-console-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        id="system-console-card"
        className="w-full max-w-xl bg-slate-950 border border-slate-800 p-6 md:p-8 font-mono text-sm text-slate-300 shadow-2xl relative"
      >
        <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <h3 className="font-['Orbitron',sans-serif] text-sm text-white tracking-widest uppercase">
              I.S.H.A Technical Console
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs px-2 py-1 border border-slate-800 hover:border-slate-600 transition-colors"
          >
            ESC / CLOSE
          </button>
        </div>

        {/* State Testing Controls */}
        <div className="mb-6">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">
            Simulate Assistant State Machine
          </p>
          <div className="flex flex-wrap gap-2">
            {stateOptions.map((st) => (
              <button
                key={st}
                onClick={() => onStateChange(st)}
                className={`px-3 py-1.5 text-xs transition-colors border ${
                  currentState === st
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40'
                    : 'border-slate-800 hover:border-slate-600 text-slate-400'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            * Note: In IDLE state, the robot face is 100% glossy black. During
            WAKE_DETECTED or LISTENING, the electric blue eyes illuminate.
          </p>
        </div>

        {/* Command Simulation Input */}
        <form onSubmit={handleCommandSubmit} className="mb-6">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">
            Simulate Voice Command Input
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputCmd}
              onChange={(e) => setInputCmd(e.target.value)}
              placeholder='e.g., "open chrome" or "create notes.txt"'
              className="flex-1 bg-black border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs px-4 py-2 uppercase tracking-wider transition-colors cursor-pointer"
            >
              Send
            </button>
          </div>
        </form>

        {/* Quick Command Suggestions */}
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">
            Quick Test Intents
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => onRunTestCommand('open chrome')}
              className="text-left px-2 py-1.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-slate-300 cursor-pointer"
            >
              &gt; open chrome
            </button>
            <button
              onClick={() => onRunTestCommand('open notepad')}
              className="text-left px-2 py-1.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-slate-300 cursor-pointer"
            >
              &gt; open notepad
            </button>
            <button
              onClick={() => onRunTestCommand('create notes.txt')}
              className="text-left px-2 py-1.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-slate-300 cursor-pointer"
            >
              &gt; create notes.txt
            </button>
            <button
              onClick={() => onRunTestCommand('what is python?')}
              className="text-left px-2 py-1.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-slate-300 cursor-pointer"
            >
              &gt; what is python?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
