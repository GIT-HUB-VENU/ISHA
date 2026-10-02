import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPT_PATH = path.resolve(__dirname, '../helpers/setVolume.ps1');

// Memory state to track system mute status and guarantee idempotency
let isSystemMuted = false;

/**
 * Handles Windows media controls (Volume, Play, Pause, Next, Prev, Mute, Unmute).
 * Executes strictly on demand with no continuous background polling.
 */
export async function executeMediaControl(commandText) {
  const normalized = commandText.trim().toLowerCase();

  let action = 'TOGGLE_MUTE';
  let value = 5;

  if (normalized.includes('play') || normalized.includes('resume') || normalized.includes('pause') || normalized.includes('stop')) {
    action = 'PLAY_PAUSE';
  } else if (normalized.includes('next')) {
    action = 'NEXT_TRACK';
  } else if (normalized.includes('previous') || normalized.includes('prev')) {
    action = 'PREV_TRACK';
  } else if (normalized.includes('unmute')) {
    action = 'UNMUTE';
  } else if (normalized.includes('mute')) {
    action = 'MUTE';
  } else if (normalized.includes('volume') || normalized.includes('sound') || normalized.includes('audio')) {
    // Check percentage volume ("set volume to 50%", "set volume to 80", "50 percent", etc.)
    const percentMatch = normalized.match(/(\d+)\s*(?:%|percent)/) || normalized.match(/to\s*(\d+)/);
    if (percentMatch && percentMatch[1]) {
      action = 'SET_VOLUME';
      value = Math.max(0, Math.min(100, parseInt(percentMatch[1], 10)));
    } else if (normalized.includes('up') || normalized.includes('increase') || normalized.includes('raise') || normalized.includes('higher')) {
      action = 'VOLUME_UP';
      const numMatch = normalized.match(/by\s*(\d+)/) || normalized.match(/(\d+)/);
      value = numMatch && numMatch[1] ? parseInt(numMatch[1], 10) : 10;
    } else if (normalized.includes('down') || normalized.includes('decrease') || normalized.includes('lower') || normalized.includes('reduce')) {
      action = 'VOLUME_DOWN';
      const numMatch = normalized.match(/by\s*(\d+)/) || normalized.match(/(\d+)/);
      value = numMatch && numMatch[1] ? parseInt(numMatch[1], 10) : 10;
    }
  }

  // Strict state checking for idempotency
  if (action === 'MUTE') {
    if (isSystemMuted) {
      // System is already muted. Do NOT execute redundant keypress.
      return {
        success: true,
        action: 'MEDIA_MUTE',
        response: 'Muted your system audio. Shhh...',
        status: 'SUCCESS',
      };
    }
  } else if (action === 'UNMUTE') {
    if (!isSystemMuted) {
      // System is already unmuted. Do NOT execute redundant keypress.
      return {
        success: true,
        action: 'MEDIA_UNMUTE',
        response: 'Unmuted! Audio is back on.',
        status: 'SUCCESS',
      };
    }
  }

  return new Promise((resolve) => {
    const cmd = `powershell -ExecutionPolicy Bypass -File "${SCRIPT_PATH}" -action "${action}" -value ${value}`;
    exec(cmd, { timeout: 4000 }, (error, stdout) => {
      if (error || !stdout) {
        return resolve({
          success: false,
          action: `MEDIA_${action}`,
          response: "I couldn't adjust the media control.",
          status: 'FAILED',
        });
      }

      try {
        const parsed = JSON.parse(stdout.trim());
        let spokenMsg = 'Adjusted media!';
        if (action === 'PLAY_PAUSE') spokenMsg = 'Toggled playback!';
        else if (action === 'NEXT_TRACK') spokenMsg = 'Skipping to the next track!';
        else if (action === 'PREV_TRACK') spokenMsg = 'Playing the previous track!';
        else if (action === 'MUTE') {
          isSystemMuted = true;
          spokenMsg = 'Muted your system audio. Shhh...';
        } else if (action === 'UNMUTE') {
          isSystemMuted = false;
          spokenMsg = 'Unmuted! Audio is back on.';
        } else if (action === 'VOLUME_UP' || action === 'VOLUME_DOWN' || action === 'SET_VOLUME') {
          isSystemMuted = false;
          if (action === 'VOLUME_UP') spokenMsg = 'Turned up the volume!';
          else if (action === 'VOLUME_DOWN') spokenMsg = 'Turned down the volume a bit!';
          else if (action === 'SET_VOLUME') spokenMsg = `Set system volume to ${value} percent!`;
        }

        resolve({
          success: Boolean(parsed.success),
          action: `MEDIA_${action}`,
          response: spokenMsg,
          status: parsed.success ? 'SUCCESS' : 'FAILED',
        });
      } catch (err) {
        if (action === 'MUTE') isSystemMuted = true;
        if (action === 'UNMUTE') isSystemMuted = false;
        resolve({
          success: true,
          action: `MEDIA_${action}`,
          response: action === 'MUTE' ? 'Muted your system audio. Shhh...' : action === 'UNMUTE' ? 'Unmuted! Audio is back on.' : 'Media command executed.',
          status: 'SUCCESS',
        });
      }
    });
  });
}
