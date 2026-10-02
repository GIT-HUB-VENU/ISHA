import { executeAgentCommand } from './backend/services/commandExecutor.js';

/**
 * Executes real Windows desktop application launching, closing, media controls,
 * screenshots, photo captures, multi-step actions, and workspace file operations.
 */
export async function handleDesktopCommand(commandText) {
  return await executeAgentCommand(commandText);
}
