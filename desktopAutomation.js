import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKSPACE_DIR = path.resolve(__dirname, 'isha_workspace');

// Ensure isha_workspace directory exists
if (!fs.existsSync(WORKSPACE_DIR)) {
  try {
    fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
  } catch (e) {
    console.error('Failed to create isha_workspace:', e);
  }
}

/**
 * Executes real Windows desktop application launching, closing, & workspace file operations.
 */
export function handleDesktopCommand(commandText) {
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
    .replace(/\b(?:clothes|closed|closing|clause|cross)\b/g, 'close')
    .replace(/\bwhat'?s?\s*app\b/g, 'whatsapp')
    .replace(/\bwasap\b/g, 'whatsapp')
    .replace(/\bcalc(?:ulator|ater|ulation)?\b/g, 'calculator')
    .replace(/\bnote\s*pad\b/g, 'notepad')
    .replace(/\bgoogle\s*chrome\b/g, 'chrome')
    .replace(/\bcrome\b/g, 'chrome')
    .replace(/\bbrave\s*browser\b/g, 'brave')
    .replace(/\b(?:vs\s*code|visual\s*studio\s*code|code\s*editor)\b/g, 'vscode')
    .replace(/\btask\s*manager\b/g, 'taskmanager')
    .replace(/\bcommand\s*prompt\b/g, 'terminal')
    .replace(/\bfile\s*(?:explorer|manager)\b/g, 'explorer')
    .replace(/\bmy\s*files\b/g, 'explorer')
    .replace(/\bcontrol\s*panel\b/g, 'controlpanel');

  // 1. Application Closing Intents ("close calculator", "close vscode", "close task manager", etc.)
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
    // Special Command: Close All Applications (Excluding Chrome)
    const isCloseAllCommand =
      normalized.includes('close all') ||
      normalized.includes('close everything') ||
      normalized.includes('terminate all') ||
      normalized.includes('exit all') ||
      normalized.includes('stop all') ||
      normalized.includes('kill all') ||
      normalized === 'close all applications' ||
      normalized === 'close all application' ||
      normalized === 'close all apps' ||
      normalized === 'close all open apps' ||
      normalized === 'close all opened applications' ||
      normalized === 'close all opened apps' ||
      normalized === 'close all running applications' ||
      normalized === 'close all running apps';

    if (isCloseAllCommand) {
      const closeAllCmd = `powershell -Command "Stop-Process -Name Code, code, Taskmgr, taskmgr, calc, CalculatorApp, Calculator, notepad, NotepadApp, WhatsApp, WhatsApp.Server, WhatsApp.Root, brave, Spotify, spotify, Discord, discord, msedge, mspaint, SystemSettings, WindowsTerminal, cmd -Force -ErrorAction SilentlyContinue; (New-Object -ComObject Shell.Application).Windows() | ForEach-Object { $_.Quit() }"`;
      exec(closeAllCmd, (err) => {
        if (err) console.error('Notice closing all applications:', err);
      });
      return {
        intent: 'CLOSE_ALL_APPLICATIONS',
        response: 'Closed all opened applications Well.. Im not Closing Myself',
        status: 'SUCCESS',
      };
    }

    // If user only said "close" or "close app" without naming the application
    if (
      normalized === 'close' ||
      normalized === 'close app' ||
      normalized === 'close application' ||
      normalized === 'close the app'
    ) {
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Which application would you like me to close? Please say close whatsapp, close vscode, or close task manager.',
        status: 'SUCCESS',
      };
    }

    if (
      normalized.includes('vscode') ||
      normalized.includes('vs code') ||
      normalized.includes('code')
    ) {
      exec('powershell -Command "Stop-Process -Name Code, code -Force -ErrorAction SilentlyContinue"; taskkill /F /IM Code.exe /T', (err) => {
        if (err) console.error('Notice closing VS Code:', err);
      });
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Closed Visual Studio Code.',
        status: 'SUCCESS',
      };
    }

    if (
      normalized.includes('taskmanager') ||
      normalized.includes('task manager') ||
      normalized.includes('taskmgr')
    ) {
      exec('powershell -Command "Stop-Process -Name Taskmgr, taskmgr -Force -ErrorAction SilentlyContinue"; taskkill /F /IM Taskmgr.exe /IM taskmgr.exe /T', (err) => {
        if (err) console.error('Notice closing Task Manager:', err);
      });
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Closed Task Manager.',
        status: 'SUCCESS',
      };
    }

    if (
      normalized.includes('calculator') ||
      normalized.includes('calc') ||
      normalized.includes('calculate')
    ) {
      exec('powershell -Command "Stop-Process -Name calc, CalculatorApp, Calculator -Force -ErrorAction SilentlyContinue"; taskkill /F /IM calc.exe /IM CalculatorApp.exe /IM Calculator.exe /T', (err) => {
        if (err) console.error('Notice closing calc:', err);
      });
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Closed Windows Calculator.',
        status: 'SUCCESS',
      };
    }

    if (
      normalized.includes('notepad') ||
      normalized.includes('text editor') ||
      normalized.includes('notes')
    ) {
      exec('powershell -Command "Stop-Process -Name notepad, NotepadApp -Force -ErrorAction SilentlyContinue"; taskkill /F /IM notepad.exe /IM NotepadApp.exe /T', (err) => {
        if (err) console.error('Notice closing notepad:', err);
      });
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Closed Notepad.',
        status: 'SUCCESS',
      };
    }

    if (
      normalized.includes('chrome') ||
      normalized.includes('google chrome') ||
      normalized.includes('browser')
    ) {
      exec('powershell -Command "Stop-Process -Name chrome -Force -ErrorAction SilentlyContinue"; taskkill /F /IM chrome.exe /T', (err) => {
        if (err) console.error('Notice closing chrome:', err);
      });
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Closed Google Chrome.',
        status: 'SUCCESS',
      };
    }

    if (normalized.includes('whatsapp')) {
      exec('powershell -Command "Stop-Process -Name WhatsApp, WhatsApp.Server, WhatsApp.Root -Force -ErrorAction SilentlyContinue"; taskkill /F /IM WhatsApp.exe /IM WhatsApp.Server.exe /IM WhatsApp.Root.exe /T', (err) => {
        if (err) console.error('Notice closing whatsapp:', err);
      });
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Closed WhatsApp.',
        status: 'SUCCESS',
      };
    }

    if (normalized.includes('brave')) {
      exec('powershell -Command "Stop-Process -Name brave -Force -ErrorAction SilentlyContinue"; taskkill /F /IM brave.exe /T', (err) => {
        if (err) console.error('Notice closing brave:', err);
      });
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Closed Brave Browser.',
        status: 'SUCCESS',
      };
    }

    if (normalized.includes('spotify')) {
      exec('powershell -Command "Stop-Process -Name Spotify, spotify -Force -ErrorAction SilentlyContinue"; taskkill /F /IM Spotify.exe /T', (err) => {
        if (err) console.error('Notice closing spotify:', err);
      });
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Closed Spotify.',
        status: 'SUCCESS',
      };
    }

    if (normalized.includes('discord')) {
      exec('powershell -Command "Stop-Process -Name Discord, discord -Force -ErrorAction SilentlyContinue"; taskkill /F /IM Discord.exe /T', (err) => {
        if (err) console.error('Notice closing discord:', err);
      });
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Closed Discord.',
        status: 'SUCCESS',
      };
    }

    if (normalized.includes('edge') || normalized.includes('microsoft edge')) {
      exec('powershell -Command "Stop-Process -Name msedge -Force -ErrorAction SilentlyContinue"; taskkill /F /IM msedge.exe /T', (err) => {
        if (err) console.error('Notice closing edge:', err);
      });
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Closed Microsoft Edge.',
        status: 'SUCCESS',
      };
    }

    if (normalized.includes('paint') || normalized.includes('mspaint')) {
      exec('powershell -Command "Stop-Process -Name mspaint -Force -ErrorAction SilentlyContinue"; taskkill /F /IM mspaint.exe /T', (err) => {
        if (err) console.error('Notice closing paint:', err);
      });
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Closed MS Paint.',
        status: 'SUCCESS',
      };
    }

    if (normalized.includes('settings')) {
      exec('powershell -Command "Stop-Process -Name SystemSettings -Force -ErrorAction SilentlyContinue"; taskkill /F /IM SystemSettings.exe /T', (err) => {
        if (err) console.error('Notice closing settings:', err);
      });
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Closed Windows Settings.',
        status: 'SUCCESS',
      };
    }

    if (
      normalized.includes('terminal') ||
      normalized.includes('command prompt') ||
      normalized.includes('cmd') ||
      normalized.includes('powershell')
    ) {
      exec('powershell -Command "Stop-Process -Name WindowsTerminal -Force -ErrorAction SilentlyContinue"; taskkill /F /IM cmd.exe /IM WindowsTerminal.exe /T', (err) => {
        if (err) console.error('Notice closing terminal:', err);
      });
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Closed Command Terminal.',
        status: 'SUCCESS',
      };
    }

    if (
      normalized.includes('explorer') ||
      normalized.includes('file manager') ||
      normalized.includes('files') ||
      normalized.includes('folder')
    ) {
      exec('powershell -Command "(New-Object -ComObject Shell.Application).Windows() | ForEach-Object { $_.Quit() }"', (err) => {
        if (err) console.error('Notice closing explorer windows:', err);
      });
      return {
        intent: 'CLOSE_APPLICATION',
        response: 'Closed File Explorer windows.',
        status: 'SUCCESS',
      };
    }

    // Generic Close Fallback
    const targetMatch = normalized.match(/(?:close|exit|quit|stop|kill|shut|terminate)\s+(?:the\s+)?([a-zA-Z0-9_\-]+)/);
    if (targetMatch && targetMatch[1]) {
      const targetApp = targetMatch[1];
      exec(`powershell -Command "Stop-Process -Name '${targetApp}' -Force -ErrorAction SilentlyContinue"; taskkill /F /IM ${targetApp}.exe /T`, (err) => {
        if (err) console.error(`Notice closing ${targetApp}:`, err);
      });
      return {
        intent: 'CLOSE_APPLICATION',
        response: `Closed ${targetApp}.`,
        status: 'SUCCESS',
      };
    }
  }

  // 2. Application Launching Intents
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
      response: 'Opening Visual Studio Code.',
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
      response: 'Opening Task Manager.',
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
      response: 'Opening Windows Calculator.',
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
      response: 'Opening Notepad.',
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
      response: 'Opening Google Chrome.',
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
      response: 'Opening WhatsApp application.',
      status: 'SUCCESS',
    };
  }

  if (normalized.includes('brave')) {
    exec('start brave || start "" "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe" || start "" "C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe" || start chrome', (err) => {
      if (err) console.error('Failed to launch brave:', err);
    });
    return {
      intent: 'OPEN_APPLICATION',
      response: 'Opening Brave Browser.',
      status: 'SUCCESS',
    };
  }

  if (normalized.includes('spotify')) {
    exec('start spotify: || start "" "%APPDATA%\\Spotify\\Spotify.exe"', (err) => {
      if (err) console.error('Failed to launch Spotify:', err);
    });
    return {
      intent: 'OPEN_APPLICATION',
      response: 'Opening Spotify.',
      status: 'SUCCESS',
    };
  }

  if (normalized.includes('discord')) {
    exec('start discord: || start "" "%LOCALAPPDATA%\\Discord\\Update.exe" --processStart Discord.exe', (err) => {
      if (err) console.error('Failed to launch Discord:', err);
    });
    return {
      intent: 'OPEN_APPLICATION',
      response: 'Opening Discord.',
      status: 'SUCCESS',
    };
  }

  if (normalized.includes('edge') || normalized.includes('microsoft edge')) {
    exec('start msedge', (err) => {
      if (err) console.error('Failed to launch Edge:', err);
    });
    return {
      intent: 'OPEN_APPLICATION',
      response: 'Opening Microsoft Edge.',
      status: 'SUCCESS',
    };
  }

  if (normalized.includes('paint') || normalized.includes('mspaint')) {
    exec('start mspaint', (err) => {
      if (err) console.error('Failed to launch Paint:', err);
    });
    return {
      intent: 'OPEN_APPLICATION',
      response: 'Opening MS Paint.',
      status: 'SUCCESS',
    };
  }

  if (normalized.includes('settings')) {
    exec('start ms-settings:', (err) => {
      if (err) console.error('Failed to launch Settings:', err);
    });
    return {
      intent: 'OPEN_APPLICATION',
      response: 'Opening Windows Settings.',
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
      response: 'Opening Command Terminal.',
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
      response: 'Opening File Explorer in isha_workspace.',
      status: 'SUCCESS',
    };
  }

  // 3. File Operations (Create, Read, Write, Append, Update)
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
        response: `Created ${fileName} in workspace and opened in Notepad.`,
        status: 'SUCCESS',
      };
    } catch (e) {
      console.error('File creation error:', e);
      return {
        intent: 'CREATE_FILE',
        response: `Failed to create file ${fileName}: ${e.message}`,
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
        response: `Updated ${fileName} with new content and opened in Notepad.`,
        status: 'SUCCESS',
      };
    } catch (e) {
      try {
        fs.writeFileSync(filePath, textToAppend, 'utf8');
        exec(`start notepad "${filePath}"`);
        return {
          intent: 'WRITE_FILE',
          response: `Created and updated ${fileName} in Notepad.`,
          status: 'SUCCESS',
        };
      } catch (err) {
        return {
          intent: 'WRITE_FILE',
          response: `Failed to update file: ${err.message}`,
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
          response: `Opened ${fileName} in Notepad. Preview: "${preview}"`,
          status: 'SUCCESS',
        };
      } catch (e) {
        return {
          intent: 'READ_FILE',
          response: `Could not read file ${fileName}.`,
          status: 'FAILED',
        };
      }
    } else {
      return {
        intent: 'READ_FILE',
        response: `File ${fileName} does not exist in workspace.`,
        status: 'FAILED',
      };
    }
  }

  // 4. Social & Conversational Greetings ("say hi", "say hello", "hi", "hello", "hey isha", etc.)
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
      response: 'Hello! I am ISHA...',
      status: 'SUCCESS',
    };
  }

  // 5. Repeat & Say Command Intent ("repeat hello world", "say good morning", "say after me ...")
  if (
    normalized.startsWith('repeat') ||
    normalized.startsWith('say')
  ) {
    const repeatPhrase = commandText
      .replace(/^(?:repeat\s*after\s*me|repeat|say\s*after\s*me|say)\s*/i, '')
      .trim();

    return {
      intent: 'REPEAT',
      response: repeatPhrase || 'What would you like me to say?',
      status: 'SUCCESS',
    };
  }

  // 5. System Controls (Mute, Volume Up/Down, Media, Lock PC)
  if (normalized.includes('mute') || normalized.includes('unmute')) {
    exec('powershell -Command "(New-Object -ComObject WScript.Shell).SendKeys([char]173)"', () => { });
    return {
      intent: 'SYSTEM_CONTROL',
      response: 'Toggled system audio mute.',
      status: 'SUCCESS',
    };
  }

  if (normalized.includes('volume')) {
    // Zero volume equals Mute command activation
    if (
      normalized.includes('zero') ||
      normalized.includes(' 0') ||
      normalized.endsWith(' 0') ||
      normalized.includes('by 0') ||
      normalized.includes('to 0')
    ) {
      exec('powershell -Command "(New-Object -ComObject WScript.Shell).SendKeys([char]173)"', () => { });
      return {
        intent: 'SYSTEM_CONTROL',
        response: 'Toggled system audio mute.',
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
        exec('powershell -Command "(New-Object -ComObject WScript.Shell).SendKeys([char]173)"', () => { });
        return {
          intent: 'SYSTEM_CONTROL',
          response: 'Toggled system audio mute.',
          status: 'SUCCESS',
        };
      }

      steps = Math.max(1, Math.min(50, steps));

      exec(`powershell -Command "$w=New-Object -ComObject WScript.Shell; 1..${steps} | % {$w.SendKeys([char]175)}"`, () => { });
      return {
        intent: 'SYSTEM_CONTROL',
        response: `Increased system volume by ${steps} levels.`,
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
        exec('powershell -Command "(New-Object -ComObject WScript.Shell).SendKeys([char]173)"', () => { });
        return {
          intent: 'SYSTEM_CONTROL',
          response: 'Toggled system audio mute.',
          status: 'SUCCESS',
        };
      }

      steps = Math.max(1, Math.min(50, steps));

      exec(`powershell -Command "$w=New-Object -ComObject WScript.Shell; 1..${steps} | % {$w.SendKeys([char]174)}"`, () => { });
      return {
        intent: 'SYSTEM_CONTROL',
        response: `Decreased system volume by ${steps} levels.`,
        status: 'SUCCESS',
      };
    }
  }

  if (normalized.includes('pause music') || normalized.includes('play music') || normalized.includes('media play') || normalized.includes('media pause')) {
    exec('powershell -Command "(New-Object -ComObject WScript.Shell).SendKeys([char]179)"', () => { });
    return {
      intent: 'SYSTEM_CONTROL',
      response: 'Toggled media playback.',
      status: 'SUCCESS',
    };
  }

  if (normalized.includes('lock pc') || normalized.includes('lock computer') || normalized.includes('lock screen')) {
    exec('rundll32.exe user32.dll,LockWorkStation', () => { });
    return {
      intent: 'SYSTEM_CONTROL',
      response: 'Locking computer screen.',
      status: 'SUCCESS',
    };
  }

  // 6. Web Search & YouTube & Quick Sites (ChatGPT, GitHub, Wikipedia)
  if (normalized.includes('youtube') || (normalized.startsWith('play ') && !normalized.includes('music'))) {
    let query = commandText
      .replace(/^(?:play|search|on|youtube)\s*/gi, '')
      .replace(/\s*(?:on\s*youtube|youtube)$/gi, '')
      .trim();
    if (!query) query = 'trending music';

    exec(`start chrome "https://www.youtube.com/results?search_query=${encodeURIComponent(query)}" || start msedge "https://www.youtube.com/results?search_query=${encodeURIComponent(query)}"`, () => { });
    return {
      intent: 'WEB_SEARCH',
      response: `Searching and playing "${query}" on YouTube.`,
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
      response: `Searching Google for "${query}".`,
      status: 'SUCCESS',
    };
  }

  if (normalized.includes('chatgpt') || normalized.includes('chat gpt')) {
    exec('start chrome "https://chatgpt.com" || start msedge "https://chatgpt.com"', () => { });
    return {
      intent: 'WEB_SEARCH',
      response: 'Opening ChatGPT in browser.',
      status: 'SUCCESS',
    };
  }

  if (normalized.includes('github')) {
    exec('start chrome "https://github.com" || start msedge "https://github.com"', () => { });
    return {
      intent: 'WEB_SEARCH',
      response: 'Opening GitHub in browser.',
      status: 'SUCCESS',
    };
  }

  if (normalized.includes('wikipedia')) {
    exec('start chrome "https://wikipedia.org" || start msedge "https://wikipedia.org"', () => { });
    return {
      intent: 'WEB_SEARCH',
      response: 'Opening Wikipedia in browser.',
      status: 'SUCCESS',
    };
  }

  // 7. Time, Date, Math Solver, Jokes
  if (normalized.includes('time') || normalized.includes('clock')) {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      intent: 'UTILITIES',
      response: `The current time is ${timeStr}.`,
      status: 'SUCCESS',
    };
  }

  if (normalized.includes('date') || normalized.includes('today')) {
    const dateStr = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return {
      intent: 'UTILITIES',
      response: `Today is ${dateStr}.`,
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
          response: `The answer is ${mathResult}.`,
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

  // 8. Social & Conversational Greetings
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
      response: 'Hello! I am ISHA...',
      status: 'SUCCESS',
    };
  }

  if (normalized.includes('python')) {
    return {
      intent: 'CONVERSATION',
      response:
        'Python is a high-level programming language used for software development, automation, and AI.',
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
        'Iam ISHA... Venu created me ! Now i deal with his laptop and all the digital chaos, whether he likes it or not who cares !',
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
        'I can open/close desktop apps, repeat sentences, search Google & YouTube, control volume, solve math, and manage workspace files.',
      status: 'SUCCESS',
    };
  }

  // Fallback for general speech instructions
  return {
    intent: 'CONVERSATION',
    response: `ask Venu Do not disturb Me `,
    status: 'SUCCESS',
  };
}
