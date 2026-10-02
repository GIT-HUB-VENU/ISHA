/**
 * Command Planner for I.S.H.A Desktop Agent
 * Parses natural language input into structured intent plans (Single & Multi-step).
 */
export function planCommand(commandText) {
  if (!commandText || typeof commandText !== 'string') {
    return { type: 'SINGLE_STEP', steps: [{ intent: 'UNKNOWN', text: '' }] };
  }

  const raw = commandText.trim();
  const normalized = raw.toLowerCase().replace(/\bright\b/g, 'write');

  // Multi-step delimiters (" and then ", " then ", " and ", " & ")
  const multiStepDelimiters = /\s+(?:and\s+then|then|and|&)\s+/i;

  if (multiStepDelimiters.test(raw)) {
    const rawParts = raw.split(multiStepDelimiters).map((s) => s.trim()).filter(Boolean);

    // Prevent splitting search queries like "search Tom and Jerry" or conversational phrases
    const isSingleQueryPattern = /^(?:search|google|find|play|say|repeat)\b/i.test(normalized) && rawParts.length === 2 && !/^(?:open|launch|start|switch|close|exit|quit|stop|kill|search|google|play|take|calculate|create|write|read|say|repeat|what|how|where|when|tell)\b/i.test(rawParts[1]);

    if (rawParts.length > 1 && !isSingleQueryPattern) {
      const processedParts = [];
      let lastAppVerb = '';

      for (let i = 0; i < rawParts.length; i++) {
        let part = rawParts[i];
        const partNorm = part.toLowerCase();

        const matchVerb = partNorm.match(/^(open|launch|start|switch\s+to|switch\s+back\s+to|go\s*to|close|exit|quit|stop|kill|terminate)\b/i);
        if (matchVerb) {
          lastAppVerb = matchVerb[0];
        } else if (lastAppVerb && !/^(?:what|tell|how|where|when|who|search|google|play|say|repeat|create|write|read)\b/i.test(partNorm)) {
          // Inherit app verb (e.g. "switch to ide and idle" -> "switch to idle")
          part = `${lastAppVerb} ${part}`;
        }
        processedParts.push(part);
      }

      return {
        type: 'MULTI_STEP',
        steps: processedParts.map((part) => parseSingleIntent(part)),
      };
    }
  }

  return {
    type: 'SINGLE_STEP',
    steps: [parseSingleIntent(raw)],
  };
}

function parseSingleIntent(partText) {
  const norm = partText.toLowerCase().trim().replace(/\bright\b/g, 'write');

  // Media Controls
  if (
    norm.includes('play music') ||
    norm.includes('pause music') ||
    norm.includes('resume music') ||
    norm.includes('stop the music') ||
    norm.includes('next song') ||
    norm.includes('previous song') ||
    norm.includes('volume') ||
    norm === 'mute' ||
    norm === 'unmute' ||
    norm.includes('mute') ||
    norm.includes('unmute')
  ) {
    return { intent: 'MEDIA_CONTROL', text: partText };
  }

  // Screenshot
  if (
    norm.includes('screenshot') ||
    norm.includes('capture the screen') ||
    norm.includes('capture my screen') ||
    norm.includes('take a screenshot')
  ) {
    return { intent: 'SCREENSHOT', text: partText };
  }

  // Open Camera Application
  if (norm === 'open camera' || norm === 'launch camera' || norm === 'open my camera' || norm === 'start camera' || norm === 'open webcam') {
    return { intent: 'OPEN_CAMERA', text: partText };
  }

  // Close All Applications ("close all", "close all application", "close all apps", etc.)
  const isCloseAllCommand =
    norm === 'close all' ||
    norm === 'close all application' ||
    norm === 'close all applications' ||
    norm === 'close all apps' ||
    norm === 'close all open apps' ||
    norm === 'close all opened applications' ||
    norm === 'close all opened apps' ||
    norm === 'close all running applications' ||
    norm === 'close all running apps' ||
    norm === 'close everything' ||
    norm === 'terminate all' ||
    norm === 'exit all' ||
    norm === 'stop all' ||
    norm === 'kill all' ||
    norm.includes('close all') ||
    norm.includes('close everything') ||
    norm.includes('terminate all') ||
    norm.includes('exit all') ||
    norm.includes('stop all') ||
    norm.includes('kill all');

  if (isCloseAllCommand) {
    return { intent: 'CLOSE_ALL_APPLICATIONS', text: partText };
  }

  // Contextual Close ("close this", "close it", "remove this", "close this window")
  if (
    norm === 'close this' ||
    norm === 'close this window' ||
    norm === 'remove this' ||
    norm === 'remove this window' ||
    norm === 'close it' ||
    norm === 'close current window' ||
    norm === 'close current app' ||
    norm === 'close active window' ||
    norm === 'exit this' ||
    norm === 'get rid of this' ||
    norm === 'close this tab' ||
    norm === 'close current tab' ||
    norm === 'close tab' ||
    norm === 'close window' ||
    norm.includes('close this') ||
    norm.includes('close tab')
  ) {
    return { intent: 'CLOSE_CONTEXTUAL', text: partText };
  }

  // Explicit App Close ("close chrome", "close notepad", etc.)
  if (
    norm.startsWith('close ') ||
    norm.startsWith('exit ') ||
    norm.startsWith('quit ') ||
    norm.startsWith('stop ') ||
    norm.startsWith('kill ') ||
    norm.startsWith('terminate ')
  ) {
    const target = norm.replace(/^(?:close|exit|quit|stop|kill|terminate)\s+(?:the\s+)?/i, '').trim();
    return { intent: 'CLOSE_NAMED_APP', target, text: partText };
  }

  // Switch Application (Intelligent Window Switching)
  const isSwitchPattern =
    norm.startsWith('switch to ') ||
    norm.startsWith('switch back to ') ||
    norm.startsWith('go back to ') ||
    norm.startsWith('return to ') ||
    norm.startsWith('activate ') ||
    norm.startsWith('focus ') ||
    norm.startsWith('show ') ||
    norm.startsWith('bring ') ||
    norm.includes(' to the front') ||
    norm.includes(' to front') ||
    norm.includes(' forward') ||
    norm.includes(' active') ||
    norm.startsWith('go to ');

  if (isSwitchPattern) {
    const isUrlOrWeb = norm.includes('http') || norm.includes('.com') || norm.includes('.org') || norm.includes('.net') || norm.includes('.io');
    if (!isUrlOrWeb) {
      let target = norm
        .replace(/^(?:switch\s+back\s+to|switch\s+to|go\s+back\s+to|return\s+to|activate|focus|show|bring|make|go\s+to)\s+/i, '')
        .replace(/\s+(?:to\s+the\s+front|to\s+front|forward|active)$/i, '')
        .trim();

      if (target.startsWith('the ')) {
        target = target.replace(/^the\s+/, '').trim();
      }

      if (target && target !== 'this' && target !== 'it' && target !== 'window' && target !== 'tab') {
        return { intent: 'SWITCH_APPLICATION', target, text: partText };
      }
    }
  }

  // Open App ("open whatsapp", "launch vs code", etc.)
  if (norm.startsWith('open ') || norm.startsWith('launch ') || norm.startsWith('start ')) {
    const target = norm.replace(/^(?:open|launch|start)\s+/i, '').trim();
    return { intent: 'OPEN_APP', target, text: partText };
  }

  // Default fallback single step
  return { intent: 'GENERAL_COMMAND', text: partText };
}
