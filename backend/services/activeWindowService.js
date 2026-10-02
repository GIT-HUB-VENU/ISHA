import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPT_PATH = path.resolve(__dirname, '../helpers/getActiveWindow.ps1');

/**
 * Gets active window context on demand (NO continuous polling).
 */
export function getActiveWindowContext() {
  return new Promise((resolve) => {
    const cmd = `powershell -ExecutionPolicy Bypass -File "${SCRIPT_PATH}"`;
    exec(cmd, { timeout: 3000 }, (error, stdout) => {
      if (error || !stdout) {
        return resolve({
          hwnd: 0,
          title: '',
          processName: 'unknown',
          processId: 0,
          isChrome: false,
          isBrowser: false,
          supportsTabClose: false,
        });
      }

      try {
        const parsed = JSON.parse(stdout.trim());
        resolve({
          hwnd: parsed.hwnd || 0,
          title: parsed.title || '',
          processName: (parsed.processName || '').toLowerCase(),
          processId: parsed.processId || 0,
          isChrome: Boolean(parsed.isChrome),
          isBrowser: Boolean(parsed.isBrowser),
          supportsTabClose: Boolean(parsed.supportsTabClose),
        });
      } catch (err) {
        resolve({
          hwnd: 0,
          title: '',
          processName: 'unknown',
          processId: 0,
          isChrome: false,
          isBrowser: false,
          supportsTabClose: false,
        });
      }
    });
  });
}
