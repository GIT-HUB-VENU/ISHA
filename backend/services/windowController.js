import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { getActiveWindowContext } from './activeWindowService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TAB_SCRIPT = path.resolve(__dirname, '../helpers/closeChromeTab.ps1');
const WIN_SCRIPT = path.resolve(__dirname, '../helpers/closeActiveWindow.ps1');
const ALL_SCRIPT = path.resolve(__dirname, '../helpers/closeAllApplications.ps1');

/**
 * Handles contextual "close this" commands based on the active foreground window.
 */
export async function closeContextualWindow() {
  const context = await getActiveWindowContext();

  // Special Chrome behavior: Close ONLY active tab if Chrome is focused
  if (context.isChrome) {
    return new Promise((resolve) => {
      const cmd = `powershell -ExecutionPolicy Bypass -File "${TAB_SCRIPT}"`;
      exec(cmd, { timeout: 3000 }, (err, stdout) => {
        resolve({
          success: true,
          action: 'CLOSE_CHROME_TAB',
          target: 'chrome_tab',
          response: 'Closed that tab!',
          status: 'SUCCESS',
        });
      });
    });
  }

  // Non-Chrome active window close (Notepad, Calculator, VS Code, Explorer, etc.)
  return new Promise((resolve) => {
    const cmd = `powershell -ExecutionPolicy Bypass -File "${WIN_SCRIPT}"`;
    exec(cmd, { timeout: 3000 }, (err, stdout) => {
      resolve({
        success: true,
        action: 'CLOSE_ACTIVE_WINDOW',
        target: context.processName || 'window',
        response: `Closed ${context.processName ? context.processName : 'that window'}!`,
        status: 'SUCCESS',
      });
    });
  });
}

/**
 * Closes all open user desktop applications safely via closeAllApplications.ps1 helper.
 */
export async function closeAllApplications() {
  return new Promise((resolve) => {
    const cmd = `powershell -ExecutionPolicy Bypass -File "${ALL_SCRIPT}"`;
    exec(cmd, { timeout: 10000 }, (err, stdout) => {
      resolve({
        success: true,
        action: 'CLOSE_ALL_APPLICATIONS',
        target: 'all_applications',
        response: 'Closed all open applications!',
        status: 'SUCCESS',
      });
    });
  });
}

/**
 * Closes an explicitly named application (e.g. "close Chrome", "close Notepad").
 */
export async function closeNamedApplication(targetApp) {
  const app = targetApp.toLowerCase().trim();

  if (app === 'all' || app.includes('all application') || app.includes('all app') || app.includes('all running') || app.includes('everything')) {
    return await closeAllApplications();
  }

  let procNames = [app];
  let displayName = targetApp;

  if (app.includes('chrome')) {
    procNames = ['chrome'];
    displayName = 'Google Chrome';
  } else if (app.includes('notepad')) {
    procNames = ['notepad', 'NotepadApp'];
    displayName = 'Notepad';
  } else if (app.includes('calc') || app.includes('calculator')) {
    procNames = ['calc', 'CalculatorApp', 'Calculator'];
    displayName = 'Calculator';
  } else if (app.includes('vscode') || app.includes('vs code') || app.includes('code')) {
    procNames = ['Code', 'code'];
    displayName = 'Visual Studio Code';
  } else if (app.includes('antigravity') || app.includes('ide')) {
    procNames = ['Antigravity IDE', 'antigravity-ide', 'Antigravity'];
    displayName = 'Antigravity IDE';
  } else if (app.includes('idle') || app.includes('idele') || app.includes('ideal')) {
    procNames = ['pythonw', 'python'];
    displayName = 'Python IDLE';
  } else if (app.includes('whatsapp')) {
    procNames = ['WhatsApp', 'WhatsApp.Server'];
    displayName = 'WhatsApp';
  } else if (app.includes('explorer') || app.includes('folder') || app.includes('files')) {
    return new Promise((resolve) => {
      exec('powershell -Command "(New-Object -ComObject Shell.Application).Windows() | ForEach-Object { $_.Quit() }"', () => {
        resolve({
          success: true,
          action: 'CLOSE_APPLICATION',
          target: 'explorer',
          response: 'Closed File Explorer!',
          status: 'SUCCESS',
        });
      });
    });
  }

  return new Promise((resolve) => {
    const psList = procNames.map((p) => `"${p}"`).join(', ');
    const cmd = `powershell -Command "Stop-Process -Name ${psList} -ErrorAction SilentlyContinue"`;
    exec(cmd, { timeout: 3000 }, (err) => {
      resolve({
        success: true,
        action: 'CLOSE_APPLICATION',
        target: displayName,
        response: `Closed ${displayName}!`,
        status: 'SUCCESS',
      });
    });
  });
}
