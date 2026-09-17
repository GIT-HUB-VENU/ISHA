/**
 * I.S.H.A Real-time Voice Wake-Word & Sequential Speech Command Engine
 * - Listens continuously for the "ISHA" wake word.
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
        // Retry if browser transition was in progress
        setTimeout(() => {
          try {
            recognitionInstance.start();
          } catch (_) {}
        }, 300);
      }
    }, delay);
  };

  attemptStart(120);
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
        // Speech recognition is already active and listening
      }
    }
  }, 7000);
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
      // Auto-recover continuously from temporary network or browser errors
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
          }, 400);
        }
      }, 100);
    }
  };

  recognition.onresult = (event) => {
    if (isProcessingCommand) return;

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const rawTranscript = result[0].transcript.trim();
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
          .replace(/^(?:hey|hi|hai|ok|okay)?\s*(?:isha|easha|eesha|asia)[,\s]*/i, '')
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

        const lowerClean = cleanCommand.toLowerCase();
        const words = lowerClean.split(/\s+/).filter(Boolean);
        const wordCount = words.length;

        const hasActionVerb =
          lowerClean.includes('open') ||
          lowerClean.includes('close') ||
          lowerClean.includes('repeat') ||
          lowerClean.includes('say') ||
          lowerClean.includes('clothes') ||
          lowerClean.includes('closed') ||
          lowerClean.includes('closing') ||
          lowerClean.includes('launch') ||
          lowerClean.includes('start') ||
          lowerClean.includes('stop') ||
          lowerClean.includes('exit') ||
          lowerClean.includes('quit') ||
          lowerClean.includes('kill') ||
          lowerClean.includes('shut') ||
          lowerClean.includes('create') ||
          lowerClean.includes('write') ||
          lowerClean.includes('read') ||
          lowerClean.includes('hi') ||
          lowerClean.includes('hai') ||
          lowerClean.includes('hello') ||
          lowerClean.includes('who');

        // A complete command phrase contains an action verb AND target application/object (word count >= 2)
        const isCompletePhrase = hasActionVerb && wordCount >= 2;

        if (result.isFinal) {
          dispatchCommand();
        } else {
          // Wait 1.5 seconds (1500ms) of full silence if speech is still interim, allowing user to complete sentence fully
          debounceExecutionTimer = setTimeout(dispatchCommand, 1500);
        }

        break;
      }

      // -------------------------------------------------------------
      // STAGE 1: Standby background monitoring for "ISHA" wake word
      // -------------------------------------------------------------
      const isWakeWordPresent =
        transcript.includes('isha') ||
        transcript.includes('easha') ||
        transcript.includes('eesha') ||
        transcript.includes('esha') ||
        transcript.includes('ishah') ||
        transcript.includes('isa') ||
        transcript.includes('asia');

      if (isWakeWordPresent) {
        let commandPart = rawTranscript
          .replace(/.*(?:hey|hi|hai|ok|okay)?\s*(?:isha|easha|eesha|asia|esha|ishah|isa)[,\s]*/i, '')
          .trim();

        if (onStateChange) onStateChange(ASSISTANT_STATES.WAKE_DETECTED);

        if (commandPart.length > 1) {
          // Inline command spoken with wake word (e.g. "ISHA open calculator")
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
            debounceExecutionTimer = setTimeout(dispatchInlineCommand, 1500);
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
              // Uninterrupted continuous stream: keep existing recognition session if active
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
