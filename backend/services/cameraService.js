import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OPEN_CAMERA_SCRIPT = path.resolve(__dirname, '../helpers/openCameraApp.ps1');

/**
 * Opens the available Windows camera application using dynamic discovery.
 */
export async function openCameraApplication() {
  return new Promise((resolve) => {
    const cmd = `powershell -ExecutionPolicy Bypass -File "${OPEN_CAMERA_SCRIPT}"`;
    exec(cmd, { timeout: 6000 }, (error, stdout) => {
      if (error || !stdout) {
        return resolve({
          success: false,
          action: 'OPEN_CAMERA',
          response: "I couldn't find a camera application.",
          status: 'FAILED',
        });
      }

      try {
        const parsed = JSON.parse(stdout.trim());
        if (parsed.success) {
          resolve({
            success: true,
            action: 'OPEN_CAMERA',
            response: 'Opening your camera application! Say cheese!',
            status: 'SUCCESS',
          });
        } else {
          resolve({
            success: false,
            action: 'OPEN_CAMERA',
            response: parsed.message || "I couldn't find a camera application.",
            status: 'FAILED',
          });
        }
      } catch (err) {
        resolve({
          success: false,
          action: 'OPEN_CAMERA',
          response: "I couldn't find a camera application.",
          status: 'FAILED',
        });
      }
    });
  });
}
