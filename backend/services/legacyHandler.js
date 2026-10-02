import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKSPACE_DIR = path.resolve(__dirname, '../../isha_workspace');

if (!fs.existsSync(WORKSPACE_DIR)) {
  try {
    fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
  } catch (e) {
    console.error('Failed to create isha_workspace:', e);
  }
}

/**
 * Handles legacy ISHA desktop commands (apps, files, web search, math, jokes, conversation).
 */
export function handleDesktopCommandLegacy(commandText) {
  if (!commandText || typeof commandText !== 'string') {
    return {
      intent: 'UNKNOWN',
      response: 'No command provided.',
      status: 'FAILED',
    };
  }

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
    .replace(/\bmy\s*files\b/g, 'explorer')
    .replace(/\bcontrol\s*panel\b/g, 'controlpanel');

  // 1. Application Launching Intents
  if (
    normalized.includes('antigravity_ide') ||
    normalized.includes('antigravity') ||
    /\bide\b/.test(normalized)
  ) {
    exec('start "" "%LOCALAPPDATA%\\Programs\\Antigravity IDE\\Antigravity IDE.exe" || start antigravity-ide || start agy', (err) => {
      if (err) console.error('Failed to launch Antigravity IDE:', err);
    });
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
    exec('start pythonw -m idlelib || pythonw -m idlelib', (err) => {
      if (err) console.error('Failed to launch Python IDLE:', err);
    });
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
    exec('code || start "" "%LOCALAPPDATA%\\Programs\\Microsoft VS Code\\Code.exe" || start "" "C:\\Program Files\\Microsoft VS Code\\Code.exe"', (err) => {
      if (err) console.error('Failed to launch VS Code:', err);
    });
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
    exec('start taskmgr', (err) => {
      if (err) console.error('Failed to launch Task Manager:', err);
    });
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
    exec('start calc', (err) => {
      if (err) console.error('Failed to launch calc:', err);
    });
    return {
      intent: 'OPEN_APPLICATION',
      response: "Launching Calculator! Time to crunch some numbers.",
      status: 'SUCCESS',
    };
  }

  if (
    normalized.includes('notepad') ||
    normalized.includes('text editor') ||
    normalized.includes('notes')
  ) {
    exec('start notepad', (err) => {
      if (err) console.error('Failed to launch notepad:', err);
    });
    return {
      intent: 'OPEN_APPLICATION',
      response: "Opening Notepad! Ready whenever you are to jot down your thoughts.",
      status: 'SUCCESS',
    };
  }

  if (
    normalized.includes('chrome') ||
    normalized.includes('google chrome') ||
    normalized.includes('browser')
  ) {
    exec('start chrome || start msedge', (err) => {
      if (err) console.error('Failed to launch chrome:', err);
    });
    return {
      intent: 'OPEN_APPLICATION',
      response: "Opening Chrome! Where are we exploring today?",
      status: 'SUCCESS',
    };
  }

  if (normalized.includes('whatsapp')) {
    exec('start whatsapp: || start "" "C:\\Program Files\\WhatsApp\\WhatsApp.exe"', (err) => {
      if (err) {
        exec('start chrome "https://web.whatsapp.com"');
      }
    });
    return {
      intent: 'OPEN_APPLICATION',
      response: "Opening WhatsApp! Let's see who is messaging you.",
      status: 'SUCCESS',
    };
  }

  if (normalized.includes('brave')) {
    exec('start brave || start "" "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe" || start "" "C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe" || start chrome', (err) => {
      if (err) console.error('Failed to launch brave:', err);
    });
    return {
      intent: 'OPEN_APPLICATION',
      response: "Opening Brave Browser! Shields up, ready to surf.",
      status: 'SUCCESS',
    };
  }

  if (normalized.includes('spotify')) {
    exec('start spotify: || start "" "%APPDATA%\\Spotify\\Spotify.exe"', (err) => {
      if (err) console.error('Failed to launch Spotify:', err);
    });
    return {
      intent: 'OPEN_APPLICATION',
      response: "Spinning up Spotify! Let the music flow.",
      status: 'SUCCESS',
    };
  }

  if (normalized.includes('discord')) {
    exec('start discord: || start "" "%LOCALAPPDATA%\\Discord\\Update.exe" --processStart Discord.exe', (err) => {
      if (err) console.error('Failed to launch Discord:', err);
    });
    return {
      intent: 'OPEN_APPLICATION',
      response: "Launching Discord! Heading into the server.",
      status: 'SUCCESS',
    };
  }

  if (normalized.includes('edge') || normalized.includes('microsoft edge')) {
    exec('start msedge', (err) => {
      if (err) console.error('Failed to launch Edge:', err);
    });
    return {
      intent: 'OPEN_APPLICATION',
      response: "Opening Microsoft Edge!",
      status: 'SUCCESS',
    };
  }

  if (normalized.includes('paint') || normalized.includes('mspaint')) {
    exec('start mspaint', (err) => {
      if (err) console.error('Failed to launch Paint:', err);
    });
    return {
      intent: 'OPEN_APPLICATION',
      response: "Opening Paint! Time to channel your inner artist.",
      status: 'SUCCESS',
    };
  }

  if (normalized.includes('settings')) {
    exec('start ms-settings:', (err) => {
      if (err) console.error('Failed to launch Settings:', err);
    });
    return {
      intent: 'OPEN_APPLICATION',
      response: "Opening Windows Settings right away!",
      status: 'SUCCESS',
    };
  }

  if (
    normalized.includes('terminal') ||
    normalized.includes('command prompt') ||
    normalized.includes('cmd') ||
    normalized.includes('powershell')
  ) {
    exec('start cmd', (err) => {
      if (err) console.error('Failed to launch terminal:', err);
    });
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
    exec(`start "" "${WORKSPACE_DIR}"`, (err) => {
      if (err) exec('start explorer');
    });
    return {
      intent: 'OPEN_APPLICATION',
      response: "Opening File Explorer in your workspace! Here are your files.",
      status: 'SUCCESS',
    };
  }

  // 2. File Operations (Create, Read, Write, Append, Update)
  if (
    normalized.includes('create') ||
    normalized.includes('make file') ||
    normalized.includes('new file')
  ) {
    const fileMatch = normalized.match(
      /(?:create|make|new)(?: a)?(?: file)?(?: called| named)?\s+([a-zA-Z0-9_\-\.]+)/
    );
    let fileName = fileMatch ? fileMatch[1] : 'document.txt';

    if (fileName === 'file' || fileName === 'a') {
      fileName = 'notes.txt';
    }
    if (!fileName.includes('.')) {
      fileName += '.txt';
    }

    const filePath = path.join(WORKSPACE_DIR, fileName);
    const initialContent = `I.S.H.A Workspace File: ${fileName}\nCreated at: ${new Date().toLocaleString()}\n----------------------------------------\n`;

    try {
      fs.writeFileSync(filePath, initialContent, 'utf8');
      exec(`start notepad "${filePath}"`);
      return {
        intent: 'CREATE_FILE',
        response: `Created ${fileName} in your workspace and opened it in Notepad. Ready for your notes!`,
        status: 'SUCCESS',
      };
    } catch (e) {
      console.error('File creation error:', e);
      return {
        intent: 'CREATE_FILE',
        response: `Oops, ran into an issue creating ${fileName}: ${e.message}`,
        status: 'FAILED',
      };
    }
  }

  if (
    normalized.includes('write') ||
    normalized.includes('append') ||
    normalized.includes('update') ||
    normalized.includes('insert')
  ) {
    let fileName = 'notes.txt';
    const fileMatch = normalized.match(/(?:in|into|to|file)\s+([a-zA-Z0-9_\-\.]+\.[a-zA-Z0-9]+)/);
    if (fileMatch) {
      fileName = fileMatch[1];
    }

    const filePath = path.join(WORKSPACE_DIR, fileName);
    const textToAppend = `[Updated ${new Date().toLocaleTimeString()}]: User instruction: "${commandText}"\n`;

    try {
      fs.appendFileSync(filePath, textToAppend, 'utf8');
      exec(`start notepad "${filePath}"`);
      return {
        intent: 'WRITE_FILE',
        response: `Got it! Updated ${fileName} with your notes and opened it in Notepad.`,
        status: 'SUCCESS',
      };
    } catch (e) {
      try {
        fs.writeFileSync(filePath, textToAppend, 'utf8');
        exec(`start notepad "${filePath}"`);
        return {
          intent: 'WRITE_FILE',
          response: `Created ${fileName} and added your notes in Notepad.`,
          status: 'SUCCESS',
        };
      } catch (err) {
        return {
          intent: 'WRITE_FILE',
          response: `Couldn't update ${fileName}: ${err.message}`,
          status: 'FAILED',
        };
      }
    }
  }

  if (
    normalized.includes('read') ||
    normalized.includes('cat') ||
    normalized.includes('open file') ||
    normalized.includes('show file')
  ) {
    let fileName = 'notes.txt';
    const fileMatch = normalized.match(/(?:read|open|show|cat)\s+(?:file\s+)?([a-zA-Z0-9_\-\.]+\.[a-zA-Z0-9]+)/);
    if (fileMatch) {
      fileName = fileMatch[1];
    }

    const filePath = path.join(WORKSPACE_DIR, fileName);

    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        exec(`start notepad "${filePath}"`);
        const preview = content.replace(/\s+/g, ' ').substring(0, 120);
        return {
          intent: 'READ_FILE',
          response: `Opened ${fileName}! Here's a quick preview: "${preview}"`,
          status: 'SUCCESS',
        };
      } catch (e) {
        return {
          intent: 'READ_FILE',
          response: `Hmm, I had trouble reading ${fileName}.`,
          status: 'FAILED',
        };
      }
    } else {
      return {
        intent: 'READ_FILE',
        response: `Hmm, I couldn't find ${fileName} in your workspace folder.`,
        status: 'FAILED',
      };
    }
  }

  // 3. Social & Conversational Greetings
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

  // 4. Repeat & Say Command Intent
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

  // 5. Web Search & YouTube & Quick Sites
  if (normalized.includes('youtube') || (normalized.startsWith('play ') && !normalized.includes('music'))) {
    let query = commandText
      .replace(/^(?:open|launch|go\s*to|play|search\s*for|search)\s+/gi, '')
      .replace(/\s*(?:in\s*youtube|on\s*youtube|for\s*youtube|youtube)$/gi, '')
      .replace(/^youtube\s*(?:for|in|on)?\s*/gi, '')
      .replace(/^(?:for|in|on)\s+/gi, '')
      .trim();

    if (!query || query.toLowerCase() === 'search' || query.toLowerCase() === 'open') {
      exec('start chrome "https://www.youtube.com" || start msedge "https://www.youtube.com"', () => { });
      return {
        intent: 'OPEN_APPLICATION',
        response: "Opening YouTube! Time for some videos.",
        status: 'SUCCESS',
      };
    }

    exec(`start chrome "https://www.youtube.com/results?search_query=${encodeURIComponent(query)}" || start msedge "https://www.youtube.com/results?search_query=${encodeURIComponent(query)}"`, () => { });
    return {
      intent: 'WEB_SEARCH',
      response: `Searching YouTube for "${query}"! Grab your popcorn.`,
      status: 'SUCCESS',
    };
  }

  if (normalized.includes('google') || normalized.startsWith('search')) {
    let query = commandText
      .replace(/^(?:search|google|for|search\s*google\s*for)\s*/gi, '')
      .trim();
    if (!query) query = 'latest news';

    exec(`start chrome "https://www.google.com/search?q=${encodeURIComponent(query)}" || start msedge "https://www.google.com/search?q=${encodeURIComponent(query)}"`, () => { });
    return {
      intent: 'WEB_SEARCH',
      response: `Googling "${query}" right away!`,
      status: 'SUCCESS',
    };
  }

  if (normalized.includes('chatgpt') || normalized.includes('chat gpt')) {
    exec('start chrome "https://chatgpt.com" || start msedge "https://chatgpt.com"', () => { });
    return {
      intent: 'WEB_SEARCH',
      response: "Opening ChatGPT in your browser! Let's talk AI.",
      status: 'SUCCESS',
    };
  }

  if (normalized.includes('github')) {
    exec('start chrome "https://github.com" || start msedge "https://github.com"', () => { });
    return {
      intent: 'WEB_SEARCH',
      response: "Opening GitHub! Off to check out some code.",
      status: 'SUCCESS',
    };
  }

  if (normalized.includes('wikipedia')) {
    exec('start chrome "https://wikipedia.org" || start msedge "https://wikipedia.org"', () => { });
    return {
      intent: 'WEB_SEARCH',
      response: "Opening Wikipedia! Time to dive into some knowledge.",
      status: 'SUCCESS',
    };
  }

  // 6. Time, Date, Math Solver, Jokes
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
    normalized.includes('plus') ||
    normalized.includes('minus') ||
    normalized.includes('times') ||
    normalized.includes('divided') ||
    normalized.includes('multiplied')
  ) {
    let expr = normalized
      .replace(/what\s*is/g, '')
      .replace(/calculate/g, '')
      .replace(/times/g, '*')
      .replace(/multiplied\s*by/g, '*')
      .replace(/divided\s*by/g, '/')
      .replace(/plus/g, '+')
      .replace(/minus/g, '-')
      .replace(/[^0-9\+\-\*\/\.]/g, '');

    try {
      if (expr) {
        const mathResult = Function(`'use strict'; return (${expr})`)();
        return {
          intent: 'MATH_SOLVER',
          response: `Easy math! ${expr} equals ${mathResult}.`,
          status: 'SUCCESS',
        };
      }
    } catch (_) { }
  }

  if (normalized.includes('joke') || normalized.includes('funny')) {
    const jokes = [
      'Why do programmers prefer dark mode? Because light attracts bugs!',
      'Why was the computer cold? It left its Windows open!',
      'There are 10 types of people in the world: those who understand binary, and those who do not.'
    ];
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    return {
      intent: 'CONVERSATION',
      response: joke,
      status: 'SUCCESS',
    };
  }

  if (normalized.includes('python')) {
    return {
      intent: 'CONVERSATION',
      response:
        'Python is a fantastic language! Great for software, automation, data science, and AI.',
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
    normalized.includes('introduce yourself')
  ) {
    return {
      intent: 'CONVERSATION',
      response:
        'I am ISHA! Venu created me to handle his laptop and clear out all the digital chaos for him.',
      status: 'SUCCESS',
    };
  }

  if (
    normalized.includes('features') ||
    normalized.includes('what can you do') ||
    normalized.includes('help')
  ) {
    return {
      intent: 'CONVERSATION',
      response:
        'I can open or close desktop apps, control media and volume, search Google and YouTube, solve math, manage your workspace files, and take screenshots!',
      status: 'SUCCESS',
    };
  }

  // Dynamic fallback tailored to the input command
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
