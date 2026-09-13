import React from 'react';
import { ASSISTANT_STATES } from '../../constants/assistant.js';

export const StatusIndicator = ({ state, onClick }) => {
  const getStatusLabel = () => {
    switch (state) {
      case ASSISTANT_STATES.WAKE_DETECTED:
        return 'Wake Detected';
      case ASSISTANT_STATES.LISTENING:
        return 'Listening...';
      case ASSISTANT_STATES.PROCESSING:
        return 'Processing';
      case ASSISTANT_STATES.EXECUTING:
        return 'Executing Action';
      case ASSISTANT_STATES.SPEAKING:
        return 'Speaking';
      case ASSISTANT_STATES.READY:
        return 'Ready';
      case ASSISTANT_STATES.ERROR:
        return 'System Error';
      case ASSISTANT_STATES.IDLE:
      case ASSISTANT_STATES.OFFLINE:
      default:
        return 'Offline Mode';
    }
  };

  const getDotStyle = () => {
    switch (state) {
      case ASSISTANT_STATES.WAKE_DETECTED:
      case ASSISTANT_STATES.LISTENING:
        return 'bg-cyan-400 shadow-[0_0_12px_#38bdf8] animate-ping';
      case ASSISTANT_STATES.PROCESSING:
      case ASSISTANT_STATES.EXECUTING:
        return 'bg-blue-500 shadow-[0_0_10px_#3b82f6] animate-pulse';
      case ASSISTANT_STATES.SPEAKING:
        return 'bg-cyan-300 shadow-[0_0_14px_#67e8f9] animate-bounce';
      case ASSISTANT_STATES.ERROR:
        return 'bg-rose-500 shadow-[0_0_10px_#f43f5e]';
      case ASSISTANT_STATES.READY:
        return 'bg-emerald-400 shadow-[0_0_8px_#34d399]';
      case ASSISTANT_STATES.IDLE:
      case ASSISTANT_STATES.OFFLINE:
      default:
        return 'bg-teal-400/90 shadow-[0_0_8px_rgba(45,212,191,0.6)]';
    }
  };

  const handleClick = () => {
    if (typeof onClick === 'function') {
      onClick();
    }
  };

  return (
    <div
      id="status-indicator"
      onClick={handleClick}
      className="fixed bottom-8 left-8 md:left-16 z-30 flex items-center gap-2.5 cursor-pointer select-none group"
      title="Click to open Assistant Console"
    >
      <div className="relative flex items-center justify-center w-3 h-3">
        <span
          className={`absolute inline-block w-2 h-2 rounded-full ${getDotStyle()}`}
        />
        <span className="inline-block w-2 h-2 rounded-full bg-teal-400" />
      </div>
      <span className="text-xs md:text-sm tracking-[0.14em] text-slate-300 group-hover:text-cyan-300 transition-colors font-light">
        {getStatusLabel()}
      </span>
    </div>
  );
};
