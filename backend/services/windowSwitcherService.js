import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPT_PATH = path.resolve(__dirname, '../helpers/switchToApplication.ps1');

// Friendly display names map
const APP_DISPLAY_NAMES = {
  whatsapp: 'WhatsApp',
  vscode: 'Visual Studio Code',
  antigravity_ide: 'Antigravity IDE',
  idle: 'Python IDLE',
  calculator: 'Calculator',
  notepad: 'Notepad',
  chrome: 'Google Chrome',
  brave: 'Brave Browser',
  spotify: 'Spotify',
  discord: 'Discord',
  edge: 'Microsoft Edge',
  paint: 'MS Paint',
  settings: 'Windows Settings',
  terminal: 'Command Terminal',
  explorer: 'File Explorer',
  taskmanager: 'Task Manager',
  camera: 'Camera',
};

/**
 * Switches focus to an ALREADY OPEN / RUNNING application window.
 * Does NOT launch a new instance if the app is not running.
 */
export async function switchToApplicationWindow(targetApp) {
  const rawTarget = (targetApp || '').trim().toLowerCase();
  const normalizedTarget = normalizeAppTarget(rawTarget);

  return new Promise((resolve) => {
    const cmd = `powershell -ExecutionPolicy Bypass -File "${SCRIPT_PATH}" -targetApp "${normalizedTarget}"`;
    exec(cmd, { timeout: 4000 }, (error, stdout) => {
      const displayName = APP_DISPLAY_NAMES[normalizedTarget] || capitalize(rawTarget);

      if (error || !stdout) {
        return resolve({
          success: false,
          intent: 'SWITCH_APPLICATION',
          target: normalizedTarget,
          response: `${displayName} isn't open right now.`,
          status: 'FAILED',
        });
      }

      try {
        const parsed = JSON.parse(stdout.trim());
        if (parsed.success && parsed.found) {
          resolve({
            success: true,
            intent: 'SWITCH_APPLICATION',
            target: normalizedTarget,
            response: `Switched to ${displayName}!`,
            status: 'SUCCESS',
          });
        } else {
          resolve({
            success: false,
            intent: 'SWITCH_APPLICATION',
            target: normalizedTarget,
            response: `${displayName} isn't open right now.`,
            status: 'FAILED',
          });
        }
      } catch (err) {
        resolve({
          success: false,
          intent: 'SWITCH_APPLICATION',
          target: normalizedTarget,
          response: `${displayName} isn't open right now.`,
          status: 'FAILED',
        });
      }
    });
  });
}

function normalizeAppTarget(app) {
  if (app.includes('whatsapp') || app.includes('wasap') || app.includes("what's app")) return 'whatsapp';
  if (app.includes('vscode') || app.includes('vs code') || app.includes('visual studio') || app.includes('code')) return 'vscode';
  if (app.includes('antigravity') || app.includes('ide')) return 'antigravity_ide';
  if (app.includes('idle') || app.includes('idele') || app.includes('ideal')) return 'idle';
  if (app.includes('calc') || app.includes('calculator')) return 'calculator';
  if (app.includes('notepad') || app.includes('notes') || app.includes('text editor')) return 'notepad';
  if (app.includes('chrome') || app.includes('google chrome') || app.includes('browser')) return 'chrome';
  if (app.includes('brave')) return 'brave';
  if (app.includes('spotify')) return 'spotify';
  if (app.includes('discord')) return 'discord';
  if (app.includes('edge')) return 'edge';
  if (app.includes('paint') || app.includes('mspaint')) return 'paint';
  if (app.includes('settings')) return 'settings';
  if (app.includes('terminal') || app.includes('cmd') || app.includes('command prompt') || app.includes('powershell')) return 'terminal';
  if (app.includes('explorer') || app.includes('file manager') || app.includes('files') || app.includes('folder')) return 'explorer';
  if (app.includes('taskmanager') || app.includes('task manager') || app.includes('taskmgr')) return 'taskmanager';
  if (app.includes('camera') || app.includes('webcam')) return 'camera';
  return app;
}

function capitalize(str) {
  if (!str) return 'Application';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
