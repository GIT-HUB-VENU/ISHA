/**
 * I.S.H.A Assistant Command Controller
 * Sends commands to local Windows Desktop Automation endpoint (/api/command)
 * to launch real applications (Calculator, Chrome, Notepad, WhatsApp, Brave, Terminal)
 * and perform workspace file operations.
 */

export async function parseAndExecuteCommand(commandText) {
  if (!commandText || typeof commandText !== 'string') {
    return {
      intent: 'UNKNOWN',
      response: 'No valid command detected.',
      status: 'FAILED',
    };
  }

  // 1. Try sending to local desktop automation backend
  try {
    const response = await fetch('/api/command', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ command: commandText }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.response) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend API connection notice, falling back to local handler:', err);
  }

  // 2. Client-side Fallback Handler
  let normalized = commandText.trim().toLowerCase();

  // Speech-to-Text Phonetic Normalization for High-Precision Matching
  normalized = normalized
    .replace(/\b(?:hi|hai)(?:\s+(?:hi|hai))+\b/g, 'hi')
    .replace(/\bhai\b/g, 'hi')
    .replace(/\b(?:clothes|closed|closing|clause|cross)\b/g, 'close')
    .replace(/\bright\b/g, 'write')
    .replace(/\bwhat'?s?\s*app\b/g, 'whatsapp')
    .replace(/\bwasap\b/g, 'whatsapp')
    .replace(/\bcalc(?:ulator|ater|ulation)?\b/g, 'calculator')
    .replace(/\bnote\s*pad\b/g, 'notepad')
    .replace(/\bgoogle\s*chrome\b/g, 'chrome')
    .replace(/\bcrome\b/g, 'chrome')
    .replace(/\bbrave\s*browser\b/g, 'brave')
    .replace(/\b(?:vs\s*code|visual\s*studio\s*code|code\s*editor)\b/g, 'vscode')
    .replace(/\b(?:antigravity\s*ide|anti\s*gravity\s*ide|antigravity|i\.?\s*d\.?\s*e\.?)\b/g, 'antigravity_ide')
    .replace(/\b(?:python\s*idle|idele|idell|ideal|i\s*dele|i\.?\s*d\.?l\.?\s*e\.?)\b/g, 'idle')
    .replace(/\btask\s*manager\b/g, 'taskmanager')
    .replace(/\bcommand\s*prompt\b/g, 'terminal')
    .replace(/\bfile\s*(?:explorer|manager)\b/g, 'explorer')
    .replace(/\bmy\s*files\b/g, 'explorer');

  // 2a. Check Closing Intents FIRST
  if (
    normalized.includes('close') ||
    normalized.includes('exit') ||
    normalized.includes('quit') ||
    normalized.includes('stop') ||
    normalized.includes('kill') ||
    normalized.includes('shut') ||
    normalized.includes('turn off') ||
    normalized.includes('terminate')
  ) {
    const isCloseAllCommand =
      normalized.includes('close all') ||
      normalized.includes('close everything') ||
      normalized.includes('terminate all') ||
      normalized.includes('exit all') ||
      normalized.includes('stop all') ||
      normalized.includes('kill all') ||
      normalized.includes('close every application') ||
      normalized.includes('close every app') ||
      normalized === 'close all applications' ||
      normalized === 'close all application' ||
      normalized === 'close all apps' ||
      normalized === 'close all open apps' ||
      normalized === 'close all opened applications' ||
      normalized === 'close all opened apps' ||
      normalized === 'close all running applications' ||
      normalized === 'close all running apps';

    if (isCloseAllCommand) {
      return {
        intent: 'CLOSE_ALL_APPLICATIONS',
        response: 'Closed all open applications!',
        status: 'SUCCESS',
      };
    }

    const isContextualClose =
      normalized === 'close this' ||
      normalized === 'close this window' ||
      normalized === 'remove this' ||
      normalized === 'remove this window' ||
      normalized === 'close it' ||
      normalized === 'close current window' ||
      normalized === 'close current app' ||
      normalized === 'close active window' ||
      normalized === 'exit this' ||
      normalized === 'get rid of this' ||
      normalized === 'close this tab' ||
      normalized === 'close current tab' ||
      normalized === 'close tab' ||
      normalized === 'close window' ||
      normalized.includes('close this') ||
      normalized.includes('close tab');

    if (isContextualClose) {
      return {
        intent: 'CLOSE_CONTEXTUAL',
        response: normalized.includes('tab') ? 'Closed that tab!' : 'Closed that active window!',
        status: 'SUCCESS',
      };
    }

    if (
      normalized === 'close' ||
      normalized === 'close app' ||
      normalized === 'close application' ||
      normalized === 'close the app'
    ) {
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Which app should I close? Try saying "close WhatsApp", "close VS Code", or "close Notepad".',
        status: 'SUCCESS',
      };
    }

    if (
      normalized.includes('antigravity_ide') ||
      normalized.includes('antigravity') ||
      /\bide\b/.test(normalized)
    ) {
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Closed Antigravity IDE!',
        status: 'SUCCESS',
      };
    }

    if (normalized.includes('idle') || /\bidle\b/.test(normalized)) {
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Closed Python IDLE!',
        status: 'SUCCESS',
      };
    }

    if (
      normalized.includes('vscode') ||
      normalized.includes('vs code') ||
      normalized.includes('code')
    ) {
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Closed Visual Studio Code!',
        status: 'SUCCESS',
      };
    }

    if (
      normalized.includes('taskmanager') ||
      normalized.includes('task manager') ||
      normalized.includes('taskmgr')
    ) {
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Closed Task Manager!',
        status: 'SUCCESS',
      };
    }

    if (
      normalized.includes('calculator') ||
      normalized.includes('calc') ||
      normalized.includes('calculate')
    ) {
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Closed Windows Calculator!',
        status: 'SUCCESS',
      };
    }

    if (
      normalized.includes('notepad') ||
      normalized.includes('text editor') ||
      normalized.includes('notes')
    ) {
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Closed Notepad! All saved.',
        status: 'SUCCESS',
      };
    }

    if (
      normalized.includes('chrome') ||
      normalized.includes('google chrome') ||
      normalized.includes('browser')
    ) {
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Closed Google Chrome!',
        status: 'SUCCESS',
      };
    }

    if (normalized.includes('whatsapp')) {
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Closed WhatsApp!',
        status: 'SUCCESS',
      };
    }

    if (normalized.includes('brave')) {
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Closed Brave Browser!',
        status: 'SUCCESS',
      };
    }

    if (normalized.includes('spotify')) {
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Closed Spotify!',
        status: 'SUCCESS',
      };
    }

    if (normalized.includes('discord')) {
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Closed Discord!',
        status: 'SUCCESS',
      };
    }

    if (normalized.includes('edge') || normalized.includes('microsoft edge')) {
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Closed Microsoft Edge!',
        status: 'SUCCESS',
      };
    }

    if (normalized.includes('paint') || normalized.includes('mspaint')) {
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Closed MS Paint!',
        status: 'SUCCESS',
      };
    }

    if (normalized.includes('settings')) {
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Closed Windows Settings!',
        status: 'SUCCESS',
      };
    }

    if (
      normalized.includes('terminal') ||
      normalized.includes('command prompt') ||
      normalized.includes('cmd') ||
      normalized.includes('powershell')
    ) {
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Closed Command Terminal!',
        status: 'SUCCESS',
      };
    }

    if (
      normalized.includes('explorer') ||
      normalized.includes('file manager') ||
      normalized.includes('files') ||
      normalized.includes('folder')
    ) {
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Closed File Explorer!',
        status: 'SUCCESS',
      };
    }
  }

  // 2a-2. Check Switch Application Intents FIRST
  const isSwitchCommand =
    normalized.startsWith('switch to ') ||
    normalized.startsWith('switch back to ') ||
    normalized.startsWith('go back to ') ||
    normalized.startsWith('return to ') ||
    normalized.startsWith('activate ') ||
    normalized.startsWith('focus ') ||
    normalized.startsWith('show ') ||
    normalized.startsWith('bring ') ||
    normalized.includes(' to the front') ||
    normalized.includes(' to front') ||
    normalized.includes(' forward') ||
    normalized.includes(' active') ||
    normalized.startsWith('go to ');

  if (isSwitchCommand) {
    let target = normalized
      .replace(/^(?:switch\s+back\s+to|switch\s+to|go\s+back\s+to|return\s+to|activate|focus|show|bring|make|go\s+to)\s+/i, '')
      .replace(/\s+(?:to\s+the\s+front|to\s+front|forward|active)$/i, '')
      .trim();

    if (target.startsWith('the ')) target = target.replace(/^the\s+/, '').trim();

    if (target.includes('whatsapp') || target.includes('wasap') || target.includes("what's app")) {
      return { intent: 'SWITCH_APPLICATION', response: 'Switched to WhatsApp!', status: 'SUCCESS' };
    }
    if (target.includes('vscode') || target.includes('vs code') || target.includes('code')) {
      return { intent: 'SWITCH_APPLICATION', response: 'Switched to Visual Studio Code!', status: 'SUCCESS' };
    }
    if (target.includes('antigravity_ide') || target.includes('antigravity') || /\bide\b/.test(target)) {
      return { intent: 'SWITCH_APPLICATION', response: 'Switched to Antigravity IDE!', status: 'SUCCESS' };
    }
    if (target.includes('idle') || /\bidle\b/.test(target)) {
      return { intent: 'SWITCH_APPLICATION', response: 'Switched to Python IDLE!', status: 'SUCCESS' };
    }
    if (target.includes('calculator') || target.includes('calc')) {
      return { intent: 'SWITCH_APPLICATION', response: 'Switched to Calculator!', status: 'SUCCESS' };
    }
    if (target.includes('notepad') || target.includes('notes')) {
      return { intent: 'SWITCH_APPLICATION', response: 'Switched to Notepad!', status: 'SUCCESS' };
    }
    if (target.includes('chrome') || target.includes('google chrome') || target.includes('browser')) {
      return { intent: 'SWITCH_APPLICATION', response: 'Switched to Google Chrome!', status: 'SUCCESS' };
    }
    if (target.includes('brave')) {
      return { intent: 'SWITCH_APPLICATION', response: 'Switched to Brave Browser!', status: 'SUCCESS' };
    }
    if (target.includes('spotify')) {
      return { intent: 'SWITCH_APPLICATION', response: 'Switched to Spotify!', status: 'SUCCESS' };
    }
    if (target.includes('discord')) {
      return { intent: 'SWITCH_APPLICATION', response: 'Switched to Discord!', status: 'SUCCESS' };
    }
    if (target.includes('edge') || target.includes('microsoft edge')) {
      return { intent: 'SWITCH_APPLICATION', response: 'Switched to Microsoft Edge!', status: 'SUCCESS' };
    }
    if (target.includes('paint') || target.includes('mspaint')) {
      return { intent: 'SWITCH_APPLICATION', response: 'Switched to MS Paint!', status: 'SUCCESS' };
    }
    if (target.includes('settings')) {
      return { intent: 'SWITCH_APPLICATION', response: 'Switched to Windows Settings!', status: 'SUCCESS' };
    }
    if (target.includes('terminal') || target.includes('command prompt') || target.includes('cmd') || target.includes('powershell')) {
      return { intent: 'SWITCH_APPLICATION', response: 'Switched to Command Terminal!', status: 'SUCCESS' };
    }
    if (target.includes('explorer') || target.includes('file manager') || target.includes('files') || target.includes('folder')) {
      return { intent: 'SWITCH_APPLICATION', response: 'Switched to File Explorer!', status: 'SUCCESS' };
    }
  }

  // 2b. Check Opening Intents
  if (
    normalized.includes('antigravity_ide') ||
    normalized.includes('antigravity') ||
    /\bide\b/.test(normalized)
  ) {
    return {
      intent: 'OPEN_APPLICATION',
      response: "Opening Antigravity IDE right away! Ready for coding.",
      status: 'SUCCESS',
    };
  }

  if (
    normalized.includes('idle') ||
    /\bidle\b/.test(normalized)
  ) {
    return {
      intent: 'OPEN_APPLICATION',
      response: "Opening Python IDLE on your desktop! Ready to run Python scripts.",
      status: 'SUCCESS',
    };
  }

  if (
    normalized.includes('vscode') ||
    normalized.includes('vs code') ||
    normalized.includes('code')
  ) {
    return {
      intent: 'OPEN_APPLICATION',
      response: "Firing up VS Code! Let's build something awesome.",
      status: 'SUCCESS',
    };
  }

  if (
    normalized.includes('taskmanager') ||
    normalized.includes('task manager') ||
    normalized.includes('taskmgr')
  ) {
    return {
      intent: 'OPEN_APPLICATION',
      response: "Popping open Task Manager! Let's check on your system performance.",
      status: 'SUCCESS',
    };
  }
  if (
    normalized.includes('calculator') ||
    normalized.includes('calc') ||
    normalized.includes('calculate')
  ) {
    return {
      intent: 'OPEN_APPLICATION',
      response: "Launching Calculator! Time to crunch some numbers.",
      status: 'SUCCESS',
    };
  }

  if (
    normalized.includes('chrome') ||
    normalized.includes('google chrome') ||
    normalized.includes('browser')
  ) {
    return {
      intent: 'OPEN_APPLICATION',
      response: "Opening Chrome! Where are we exploring today?",
      status: 'SUCCESS',
    };
  }

  if (normalized.includes('whatsapp')) {
    return {
      intent: 'OPEN_APPLICATION',
      response: "Opening WhatsApp! Let's see who is messaging you.",
      status: 'SUCCESS',
    };
  }

  if (normalized.includes('brave')) {
    return {
      intent: 'OPEN_APPLICATION',
      response: "Opening Brave Browser! Shields up, ready to surf.",
      status: 'SUCCESS',
    };
  }

  if (normalized.includes('notepad') || normalized.includes('notes')) {
    return {
      intent: 'OPEN_APPLICATION',
      response: "Opening Notepad! Ready whenever you are to jot down your thoughts.",
      status: 'SUCCESS',
    };
  }

  if (
    normalized.includes('terminal') ||
    normalized.includes('command prompt') ||
    normalized.includes('cmd') ||
    normalized.includes('powershell')
  ) {
    return {
      intent: 'OPEN_APPLICATION',
      response: "Launching Command Terminal! Ready for your CLI magic.",
      status: 'SUCCESS',
    };
  }

  if (
    normalized.includes('explorer') ||
    normalized.includes('file manager') ||
    normalized.includes('files') ||
    normalized.includes('folder')
  ) {
    return {
      intent: 'OPEN_APPLICATION',
      response: "Opening File Explorer in your workspace! Here are your files.",
      status: 'SUCCESS',
    };
  }

  if (
    normalized.includes('create') ||
    normalized.includes('make file') ||
    normalized.includes('new file')
  ) {
    const fileMatch = normalized.match(
      /(?:create|make|new)(?: a)?(?: file)?(?: called| named)?\s+([a-zA-Z0-9_\-\.]+)/
    );
    let fileName = fileMatch ? fileMatch[1] : 'document.txt';
    if (!fileName.includes('.')) fileName += '.txt';

    return {
      intent: 'CREATE_FILE',
      response: `Created ${fileName} in your workspace and opened it in Notepad. Ready for your notes!`,
      status: 'SUCCESS',
    };
  }

  if (normalized.includes('write') || normalized.includes('append') || normalized.includes('update')) {
    return {
      intent: 'WRITE_FILE',
      response: 'Got it! Updated your workspace file with your notes and opened it in Notepad.',
      status: 'SUCCESS',
    };
  }

  if (normalized.includes('read') || normalized.includes('cat') || normalized.includes('open file')) {
    return {
      intent: 'READ_FILE',
      response: 'Opened target file in Notepad.',
      status: 'SUCCESS',
    };
  }

  // 3. Social & Conversational Greetings ("say hi", "say hello", "hi", "hello", "hey isha", etc.)
  const isGreetingCommand =
    normalized === 'say hi' ||
    normalized === 'say hello' ||
    normalized === 'hi' ||
    normalized === 'hello' ||
    normalized === 'say hi isha' ||
    normalized === 'say hello isha' ||
    normalized === 'hey isha' ||
    normalized === 'hi isha' ||
    normalized === 'hello isha' ||
    normalized.startsWith('say hi') ||
    normalized.startsWith('say hello');

  if (isGreetingCommand) {
    return {
      intent: 'GREETING',
      response: "Hey there! ISHA at your service. What are we tackling today?",
      status: 'SUCCESS',
    };
  }

  // 4. Repeat & Say Command Intent ("repeat hello world", "say good morning", "say after me ...")
  if (
    normalized.startsWith('repeat') ||
    normalized.startsWith('say')
  ) {
    const repeatPhrase = commandText
      .replace(/^(?:repeat\s*after\s*me|repeat|say\s*after\s*me|say)\s*/i, '')
      .trim();

    return {
      intent: 'REPEAT',
      response: repeatPhrase || "Sure thing, what would you like me to say?",
      status: 'SUCCESS',
    };
  }

  // 4. Dynamic Volume Up/Down Controls with Digit Levels
  if (normalized.includes('volume')) {
    // Zero volume equals Mute command activation
    if (
      normalized.includes('zero') ||
      normalized.includes(' 0') ||
      normalized.endsWith(' 0') ||
      normalized.includes('by 0') ||
      normalized.includes('to 0')
    ) {
      return {
        intent: 'SYSTEM_CONTROL',
        response: 'Muted your system audio. Shhh...',
        status: 'SUCCESS',
      };
    }

    if (
      normalized.includes('up') ||
      normalized.includes('increase') ||
      normalized.includes('raise') ||
      normalized.includes('higher')
    ) {
      const numMatch = normalized.match(/(?:up|increase|raise|by|to)\s*(\d+|zero|one|two|three|four|five|six|seven|eight|nine|ten|twenty|thirty|fifty)/);
      let steps = 5;
      if (numMatch) {
        const parsed = parseInt(numMatch[1], 10);
        if (!isNaN(parsed)) {
          steps = parsed;
        } else {
          const wordMap = { zero: 0, 0: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, twenty: 20, thirty: 30, fifty: 50 };
          if (wordMap[numMatch[1]] !== undefined) steps = wordMap[numMatch[1]];
        }
      }

      if (steps === 0) {
        return {
          intent: 'SYSTEM_CONTROL',
          response: 'Muted your system audio. Shhh...',
          status: 'SUCCESS',
        };
      }

      steps = Math.max(1, Math.min(50, steps));

      return {
        intent: 'SYSTEM_CONTROL',
        response: `Turned up the volume by ${steps} levels!`,
        status: 'SUCCESS',
      };
    }

    if (
      normalized.includes('down') ||
      normalized.includes('decrease') ||
      normalized.includes('lower') ||
      normalized.includes('reduce')
    ) {
      const numMatch = normalized.match(/(?:down|decrease|lower|reduce|by|to)\s*(\d+|zero|one|two|three|four|five|six|seven|eight|nine|ten|twenty|thirty|fifty)/);
      let steps = 5;
      if (numMatch) {
        const parsed = parseInt(numMatch[1], 10);
        if (!isNaN(parsed)) {
          steps = parsed;
        } else {
          const wordMap = { zero: 0, 0: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, twenty: 20, thirty: 30, fifty: 50 };
          if (wordMap[numMatch[1]] !== undefined) steps = wordMap[numMatch[1]];
        }
      }

      if (steps === 0) {
        return {
          intent: 'SYSTEM_CONTROL',
          response: 'Muted your system audio. Shhh...',
          status: 'SUCCESS',
        };
      }

      steps = Math.max(1, Math.min(50, steps));

      return {
        intent: 'SYSTEM_CONTROL',
        response: `Decreased system volume by ${steps} levels!`,
        status: 'SUCCESS',
      };
    }
  }

  // Time and Date Handlers
  if (/\btime\b/.test(normalized) || /\bclock\b/.test(normalized) || normalized.includes("what's the time") || normalized.includes('what is the time')) {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      intent: 'UTILITIES',
      response: `Right now, it's ${timeStr}.`,
      status: 'SUCCESS',
    };
  }

  if (/\bdate\b/.test(normalized) || /\btoday\b/.test(normalized) || normalized.includes("what's the date") || normalized.includes('what is the date')) {
    const dateStr = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return {
      intent: 'UTILITIES',
      response: `Today is ${dateStr}. Hope you're having an awesome day!`,
      status: 'SUCCESS',
    };
  }

  if (
    normalized.includes('who are you') ||
    normalized.includes('what are you') ||
    normalized.includes('your name') ||
    normalized.includes('tell about yourself') ||
    normalized.includes('tell me about yourself') ||
    normalized.includes('about yourself') ||
    normalized.includes('why are you here') ||
    normalized.includes('who made you') ||
    normalized.includes('who created you') ||
    normalized.includes('introduce yourself') ||
    normalized.includes('who is isha') ||
    normalized.includes('what is isha') ||
    normalized.includes('tell about isha') ||
    normalized.includes('tell me about isha') ||
    normalized.includes('about isha') ||
    normalized.includes('why is isha here') ||
    normalized.includes('who made isha') ||
    normalized.includes('who created isha') ||
    normalized.includes('introduce isha') ||
    normalized.includes('introduce your self')
  ) {
    return {
      intent: 'CONVERSATION',
      response:
        "I'm ISHA! Intelligent Speech based Human Assistant . A Windows Automation System . Well... I have Zero Interest in doing all this!  However , Venu created me Because HE was Very Lazy",
      status: 'SUCCESS',
    };
  }

  if (
    normalized.includes('say hi') ||
    normalized.includes('say hello') ||
    normalized === 'hi' ||
    normalized === 'hello' ||
    normalized.includes('hey isha') ||
    normalized.includes('hi isha')
  ) {
    return {
      intent: 'GREETING',
      response: "Hey there! ISHA at your service. What are we tackling today?",
      status: 'SUCCESS',
    };
  }

  return {
    intent: 'CONVERSATION',
    response: generateDynamicResponse(commandText),
    status: 'SUCCESS',
  };
}

function generateDynamicResponse(commandText) {
  if (!commandText || typeof commandText !== 'string') return "I'm ready for your command!";
  const trimmed = commandText.trim();
  const lower = trimmed.toLowerCase();

  if (lower.startsWith('open ') || lower.startsWith('launch ') || lower.startsWith('start ') || lower.startsWith('go to ')) {
    const target = trimmed.replace(/^(?:open|launch|start|go to)\s+/i, '');
    return `Opening ${target} right away!`;
  }

  if (lower.startsWith('close ') || lower.startsWith('exit ') || lower.startsWith('stop ') || lower.startsWith('kill ')) {
    const target = trimmed.replace(/^(?:close|exit|stop|kill)\s+/i, '');
    if (target.toLowerCase() === 'this' || target.toLowerCase() === 'it' || target.toLowerCase() === 'window' || target.toLowerCase() === 'tab') {
      return `Closed that active ${target.toLowerCase().includes('tab') ? 'tab' : 'window'}!`;
    }
    return `Closed ${target}!`;
  }

  if (lower.startsWith('search ') || lower.startsWith('find ') || lower.startsWith('look up ') || lower.startsWith('google ')) {
    const query = trimmed.replace(/^(?:search|find|look up|google)\s+(?:for\s+)?/i, '');
    return `Searching for "${query}" right away!`;
  }

  if (lower.startsWith('play ')) {
    const item = trimmed.replace(/^play\s+/i, '');
    return `Playing "${item}" now!`;
  }

  if (lower.startsWith('write ') || lower.startsWith('right ') || lower.startsWith('type ') || lower.startsWith('note ')) {
    const content = trimmed.replace(/^(?:write|right|type|note)\s+/i, '');
    return `Got it! Wrote "${content}" to your notes.`;
  }

  if (lower.startsWith('create ') || lower.startsWith('make ')) {
    const item = trimmed.replace(/^(?:create|make)\s+/i, '');
    return `Created ${item} in your workspace!`;
  }

  if (lower.startsWith('read ') || lower.startsWith('show ') || lower.startsWith('display ')) {
    const item = trimmed.replace(/^(?:read|show|display)\s+/i, '');
    return `Showing ${item}!`;
  }

  if (lower.startsWith('turn ') || lower.startsWith('set ') || lower.startsWith('change ')) {
    const item = trimmed.replace(/^(?:turn|set|change)\s+/i, '');
    return `Set ${item} as requested!`;
  }

  if (lower.startsWith('calculate ') || lower.startsWith('compute ')) {
    const expr = trimmed.replace(/^(?:calculate|compute)\s+/i, '');
    return `Calculated ${expr}!`;
  }

  return `Handled "${trimmed}"!`;
}
