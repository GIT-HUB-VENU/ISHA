import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPT_PATH = path.resolve(__dirname, '../helpers/captureScreen.ps1');
const WORKSPACE_DIR = path.resolve(__dirname, '../../isha_workspace/screenshots');

export async function takeScreenshot() {
  if (!fs.existsSync(WORKSPACE_DIR)) {
    try {
      fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
    } catch (e) {
      console.error('Failed to create screenshots directory:', e);
    }
  }

  return new Promise((resolve) => {
    const cmd = `powershell -ExecutionPolicy Bypass -File "${SCRIPT_PATH}" -outDir "${WORKSPACE_DIR}"`;
    exec(cmd, { timeout: 5000 }, (error, stdout) => {
      if (error || !stdout) {
        return resolve({
          success: false,
          action: 'SCREENSHOT',
          response: "I couldn't capture the screen.",
          status: 'FAILED',
        });
      }

      try {
        const parsed = JSON.parse(stdout.trim());
        if (parsed.success && parsed.path && fs.existsSync(parsed.path)) {
          resolve({
            success: true,
            action: 'SCREENSHOT',
            path: parsed.path,
            filename: parsed.filename,
            response: 'Snap! Captured your screen and saved it to your workspace folder.',
            status: 'SUCCESS',
          });
        } else {
          resolve({
            success: false,
            action: 'SCREENSHOT',
            response: "I couldn't capture the screen.",
            status: 'FAILED',
          });
        }
      } catch (err) {
        resolve({
          success: false,
          action: 'SCREENSHOT',
          response: "I couldn't capture the screen.",
          status: 'FAILED',
        });
      }
    });
  });
}
