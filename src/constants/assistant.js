export const ASSISTANT_STATES = {
  OFFLINE: 'OFFLINE',
  IDLE: 'IDLE',
  WAKE_DETECTED: 'WAKE_DETECTED',
  LISTENING: 'LISTENING',
  PROCESSING: 'PROCESSING',
  EXECUTING: 'EXECUTING',
  SPEAKING: 'SPEAKING',
  READY: 'READY',
  ERROR: 'ERROR',
};

export const DEFAULT_SYSTEM_STATUS = {
  state: ASSISTANT_STATES.OFFLINE,
  microphoneActive: false,
  wakeWordEnabled: true,
  speechEngine: 'Vosk Offline ASR',
  ttsEngine: 'Piper Neural TTS',
  llmStatus: 'Llama 3.2 (Local)',
  activeApp: null,
  lastCommand: null,
};
