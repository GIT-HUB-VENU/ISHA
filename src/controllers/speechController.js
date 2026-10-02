/**
 * I.S.H.A Real-time Voice Wake-Word & Sequential Speech Command Engine
 * - Listens continuously for the "ISHA" wake word with zero-lag sensitivity.
 * - Handles whispers, low tones, loud speech, and broad acoustic frequency variations.
 * - Inspects multiple speech alternatives (maxAlternatives = 5) & interim results instantly.
 * - Upon wake word detection, speaks "Yes?" verbally and displays ISHA: "Yes?".
 * - Re-arms microphone immediately after "Yes?" finishes speaking for a 5-second command window.
 * - Collects full spoken commands (debounced for complete sentences like "open calculator").
 * - Returns to background standby if no command is spoken within 5 seconds.
 */

import { ASSISTANT_STATES } from '../constants/assistant.js';
import { parseAndExecuteCommand } from './assistantController.js';

let recognitionInstance = null;
let isListeningActive = false;
let isProcessingCommand = false;
let isAwaitingCommand = false;
let commandTimeoutTimer = null;
let debounceExecutionTimer = null;
let activeCallbacks = {};

export function isSpeechSupported() {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

/**
 * Robust, zero-lag wake word detector covering whispers, low tones, loud voices, and phonetic variations.
 */
export function detectWakeWord(text) {
  if (!text || typeof text !== 'string') return false;
  const norm = text.toLowerCase().trim();

  // 1. Direct phonetic & whisper string matches
  const directPhonetics = [
    'isha', 'eesha', 'easha', 'esha', 'ishah', 'isa', 'asia',
    'aisha', 'eyesha', 'ysha', 'hisha', 'hesha', 'asha', 'ayasha',
    'is ha', 'is a', 'is ah', 'ee sha', 'i sha', 'is-ha', 'ee-sha',
    'ish', 'ishaa', 'eshaa', 'eeshaa', 'isaa', 'eash', 'is her', 'is he',
    'it\'s a', 'is how', 'is high', 'us ha', 'as ha', 'hi isha', 'hey isha'
  ];

  for (const word of directPhonetics) {
    if (norm.includes(word)) return true;
  }

  // 2. Comprehensive fuzzy regex matching across pitch, whisper & frequency variations
  const wakeRegex = /\b(?:isha|easha|eesha|esha|ishah|isa|asia|aisha|eyesha|ysha|asha|hisha|hesha|ayasha|ee\s*sha|i\s*sha|is\s*ha|is\s*a|is\s*ah|is\s*her|is\s*he|is\s*how|is\s*high|it'?s\s*a|ish)\b/i;
  return wakeRegex.test(norm);
}

export function speakResponse(text, onStart, onEnd) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onStart) onStart();
    setTimeout(() => {
      if (onEnd) onEnd();
    }, 1200);
    return;
  }

  window.speechSynthesis.cancel();
  isProcessingCommand = true;

  const utterance = new SpeechSynthesisUtterance(text);
  // Fast & crisp speech rate for "Yes?" response
  utterance.rate = text === 'Yes?' ? 1.18 : 1.08;
  utterance.pitch = text === 'Yes?' ? 1.15 : 1.05;
  utterance.volume = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const selectedVoice = voices.find(
    (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Zira') || v.name.includes('Samantha'))
  ) || voices.find((v) => v.lang.startsWith('en'));

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  utterance.onstart = () => {
    isProcessingCommand = true;
    if (onStart) onStart();
  };

  const handleFinish = () => {
    setTimeout(() => {
      isProcessingCommand = false;
      if (onEnd) onEnd();
    }, 400);
  };

  utterance.onend = () => {
    handleFinish();
  };

  utterance.onerror = () => {
    handleFinish();
  };

  window.speechSynthesis.speak(utterance);
}

export function rearmSpeechRecognition() {
  if (!isListeningActive || !recognitionInstance) return;

  try {
    recognitionInstance.stop();
  } catch (_) {}

  const attemptStart = (delay) => {
    setTimeout(() => {
      if (!isListeningActive || isProcessingCommand) return;
      try {
        recognitionInstance.start();
      } catch (_) {
        setTimeout(() => {
          try {
            recognitionInstance.start();
          } catch (_) {}
        }, 150);
      }
    }, delay);
  };

  attemptStart(50);
}

// Pre-warm Web Speech Synthesis voices for zero-latency TTS responses
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  try {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  } catch (_) {}
}

// Automatically re-arm speech recognition when returning to ISHA tab from other tabs/windows
if (typeof window !== 'undefined') {
  const handleTabActive = () => {
    if (isListeningActive && !isProcessingCommand) {
      rearmSpeechRecognition();
    }
  };

  window.addEventListener('focus', handleTabActive);
  window.addEventListener('click', handleTabActive);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      handleTabActive();
    }
  });
}

// Continuous watchdog interval: keeps speech recognition running 24/7 without silent browser dropouts
if (typeof window !== 'undefined') {
  setInterval(() => {
    if (isListeningActive && !isProcessingCommand && recognitionInstance) {
      try {
        recognitionInstance.start();
      } catch (_) {
        // Speech recognition is active
      }
    }
  }, 2000);
}

export function resetCommandTimeout(callbacks) {
  if (commandTimeoutTimer) clearTimeout(commandTimeoutTimer);

  // 5-second timer: if no command is given within 5 seconds, return to standby
  commandTimeoutTimer = setTimeout(() => {
    if (isAwaitingCommand && !isProcessingCommand) {
      isAwaitingCommand = false;
      if (callbacks.onStateChange) callbacks.onStateChange(ASSISTANT_STATES.IDLE);
      if (callbacks.onFeedback) callbacks.onFeedback(null);
      rearmSpeechRecognition();
    }
  }, 5000);
}

export function initSpeechEngine(callbacks = {}) {
  activeCallbacks = callbacks;
  const { onStateChange, onRequest, onFeedback, onError } = callbacks;

  if (!isSpeechSupported()) {
    if (onError) onError('Web Speech API is not supported in this browser environment.');
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (recognitionInstance) {
    try {
      recognitionInstance.stop();
    } catch (_) {}
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 5; // Multi-alternative evaluation for whispers & low volume tones
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    isListeningActive = true;
    if (onStateChange && !isProcessingCommand && !isAwaitingCommand) {
      onStateChange(ASSISTANT_STATES.IDLE);
    }
  };

  recognition.onerror = (event) => {
    if (event.error === 'no-speech' || event.error === 'aborted') return;
    console.warn('Speech recognition notice:', event.error);
    if (event.error === 'not-allowed') {
      isListeningActive = false;
      if (onStateChange) onStateChange(ASSISTANT_STATES.OFFLINE);
      if (onError) onError('Microphone access denied. Please grant microphone permissions.');
    } else {
      rearmSpeechRecognition();
    }
  };

  recognition.onend = () => {
    if (isListeningActive && !isProcessingCommand) {
      setTimeout(() => {
        try {
          recognition.start();
        } catch (_) {
          setTimeout(() => {
            try {
              recognition.start();
            } catch (_) {}
          }, 150);
        }
      }, 50);
    }
  };

  recognition.onresult = (event) => {
    if (isProcessingCommand) return;

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      let bestTranscript = '';
      let wakeDetectedInAlt = false;

      // Evaluate top alternatives for whispers, low tones, and pitch variations
      for (let j = 0; j < result.length; j++) {
        const altText = (result[j]?.transcript || '').trim();
        if (!altText) continue;

        if (!bestTranscript) bestTranscript = altText;

        if (detectWakeWord(altText)) {
          bestTranscript = altText;
          wakeDetectedInAlt = true;
          break;
        }
      }

      const rawTranscript = bestTranscript;
      const transcript = rawTranscript.toLowerCase();

      if (!transcript) continue;

      // Ignore self-referential introductory phrases spoken by ISHA itself
      const isSelfIntroEcho =
        transcript.includes('hello i am isha') ||
        transcript.includes("hello i'm isha") ||
        transcript.includes('i am isha') ||
        transcript.includes('iam isha');

      if (isSelfIntroEcho) continue;

      // -------------------------------------------------------------
      // STAGE 2: Currently inside the 5-second post-wake listening window
      // -------------------------------------------------------------
      if (isAwaitingCommand) {
        // Ignore standalone repeats of wake words
        const isOnlyWakeWord =
          transcript === 'isha' ||
          transcript === 'hey isha' ||
          transcript === 'hi isha' ||
          transcript === 'hai isha' ||
          transcript === 'ok isha' ||
          transcript === 'eesha';

        if (isOnlyWakeWord) continue;

        const cleanCommand = rawTranscript
          .replace(/^(?:hey|hi|hai|ok|okay)?\s*(?:isha|easha|eesha|asia|esha|ishah|isa|aisha|eyesha|ysha|asha|hisha|hesha|ayasha|ee\s*sha|i\s*sha|is\s*ha|is\s*a|is\s*ah|is\s*her|is\s*he|is\s*how|is\s*high|it'?s\s*a|ish)[,\s]*/i, '')
          .trim() || rawTranscript;

        // Show live spoken transcript to user as they speak
        if (onRequest) onRequest(cleanCommand);

        // Reset the 5s overall timeout while user is actively speaking
        resetCommandTimeout(activeCallbacks);

        if (debounceExecutionTimer) clearTimeout(debounceExecutionTimer);

        const dispatchCommand = () => {
          if (!isProcessingCommand && isAwaitingCommand) {
            isAwaitingCommand = false;
            if (commandTimeoutTimer) clearTimeout(commandTimeoutTimer);
            executeVoiceCommand(cleanCommand, activeCallbacks);
          }
        };

        if (result.isFinal) {
          dispatchCommand();
        } else {
          // 1200ms debounce of silence if speech is still interim, allowing complete sentence delivery
          debounceExecutionTimer = setTimeout(dispatchCommand, 1200);
        }

        break;
      }

      // -------------------------------------------------------------
      // STAGE 1: Standby background monitoring for "ISHA" wake word
      // -------------------------------------------------------------
      const isWakeWordPresent = wakeDetectedInAlt || detectWakeWord(transcript);

      if (isWakeWordPresent) {
        let commandPart = rawTranscript
          .replace(/.*?(?:hey|hi|hai|ok|okay)?\s*(?:isha|easha|eesha|asia|esha|ishah|isa|aisha|eyesha|ysha|asha|hisha|hesha|ayasha|ee\s*sha|i\s*sha|is\s*ha|is\s*a|is\s*ah|is\s*her|is\s*he|is\s*how|is\s*high|it'?s\s*a|ish)[,\s]*/i, '')
          .trim();

        if (onStateChange) onStateChange(ASSISTANT_STATES.WAKE_DETECTED);

        if (commandPart.length > 1) {
          // Inline command spoken with wake word (e.g. "ISHA open calculator" or whispered "isha open calc")
          if (onRequest) onRequest(commandPart);

          if (debounceExecutionTimer) clearTimeout(debounceExecutionTimer);

          const dispatchInlineCommand = () => {
            if (!isProcessingCommand) {
              executeVoiceCommand(commandPart, activeCallbacks);
            }
          };

          if (result.isFinal) {
            dispatchInlineCommand();
          } else {
            debounceExecutionTimer = setTimeout(dispatchInlineCommand, 1200);
          }
        } else {
          // Only wake word spoken -> Reply "Yes?", display ISHA: "Yes?", then open 5s command window
          isAwaitingCommand = true;
          if (onRequest) onRequest('ISHA');
          if (onFeedback) onFeedback('Yes?');

          speakResponse(
            'Yes?',
            () => {
              if (onStateChange) onStateChange(ASSISTANT_STATES.SPEAKING);
            },
            () => {
              if (onStateChange) onStateChange(ASSISTANT_STATES.LISTENING);
              if (onFeedback) onFeedback('Yes? Listening for command... (5s remaining)');
              resetCommandTimeout(activeCallbacks);
              if (!isListeningActive) {
                rearmSpeechRecognition();
              }
            }
          );
        }

        break;
      }
    }
  };

  recognitionInstance = recognition;
  return recognition;
}

export function startVoiceListening(callbacks = {}) {
  activeCallbacks = callbacks;
  const recognition = initSpeechEngine(callbacks);
  if (recognition) {
    try {
      recognition.start();
      return true;
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
    }
  }
  return false;
}

export function stopVoiceListening() {
  isListeningActive = false;
  isAwaitingCommand = false;
  isProcessingCommand = false;
  if (commandTimeoutTimer) clearTimeout(commandTimeoutTimer);
  if (debounceExecutionTimer) clearTimeout(debounceExecutionTimer);
  if (recognitionInstance) {
    try {
      recognitionInstance.stop();
    } catch (_) {}
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export async function executeVoiceCommand(commandText, callbacks = {}) {
  const { onStateChange, onRequest, onFeedback } = callbacks;
  isProcessingCommand = true;
  isAwaitingCommand = false;
  if (commandTimeoutTimer) clearTimeout(commandTimeoutTimer);
  if (debounceExecutionTimer) clearTimeout(debounceExecutionTimer);

  if (onRequest) onRequest(commandText);
  if (onStateChange) onStateChange(ASSISTANT_STATES.PROCESSING);

  const result = await parseAndExecuteCommand(commandText);

  if (onStateChange) onStateChange(ASSISTANT_STATES.EXECUTING);

  setTimeout(() => {
    if (onFeedback) onFeedback(result.response);

    speakResponse(
      result.response,
      () => {
        if (onStateChange) onStateChange(ASSISTANT_STATES.SPEAKING);
      },
      () => {
        isProcessingCommand = false;
        if (onStateChange) onStateChange(ASSISTANT_STATES.IDLE);
        rearmSpeechRecognition();
      }
    );
  }, 400);
}
