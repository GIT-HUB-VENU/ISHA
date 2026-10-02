import { planCommand } from './commandPlanner.js';
import { executeMediaControl } from './mediaController.js';
import { takeScreenshot } from './screenshotService.js';
import { openCameraApplication } from './cameraService.js';
import { closeContextualWindow, closeNamedApplication, closeAllApplications } from './windowController.js';
import { switchToApplicationWindow } from './windowSwitcherService.js';
import { handleDesktopCommandLegacy } from './legacyHandler.js';

/**
 * Main Execution Engine for I.S.H.A Desktop Agent.
 * Evaluates single and multi-step plans sequentially with action verification.
 */
export async function executeAgentCommand(commandText) {
  if (!commandText || typeof commandText !== 'string') {
    return {
      success: false,
      intent: 'UNKNOWN',
      response: 'No command provided.',
      status: 'FAILED',
    };
  }

  const plan = planCommand(commandText);

  // Single Step Execution
  if (plan.type === 'SINGLE_STEP') {
    const step = plan.steps[0];
    return await executeSingleStep(step, commandText);
  }

  // Multi-step Execution
  const completedSummaries = [];
  let multiStepFailed = false;
  let lastErrorMsg = '';

  for (let i = 0; i < plan.steps.length; i++) {
    const step = plan.steps[i];
    const res = await executeSingleStep(step, step.text);

    if (res.status === 'SUCCESS' || res.success) {
      completedSummaries.push(res.response || `Completed step ${i + 1}`);
    } else {
      multiStepFailed = true;
      lastErrorMsg = res.response || `Step ${i + 1} failed`;
      break;
    }
  }

  if (multiStepFailed) {
    const partialSuccessMsg = completedSummaries.length > 0
      ? `${completedSummaries.join('. ')}, but I couldn't complete the rest.`
      : `I couldn't complete that multi-step command: ${lastErrorMsg}`;

    return {
      success: false,
      intent: 'MULTI_STEP',
      response: partialSuccessMsg,
      status: 'FAILED',
    };
  }

  return {
    success: true,
    intent: 'MULTI_STEP',
    response: `All set! ${completedSummaries.join(' ')}`,
    status: 'SUCCESS',
  };
}

/**
 * Executes an individual step safely with proper error handling.
 */
async function executeSingleStep(step, fullText) {
  try {
    switch (step.intent) {
      case 'MEDIA_CONTROL':
        return await executeMediaControl(fullText);

      case 'SCREENSHOT':
        return await takeScreenshot();

      case 'OPEN_CAMERA':
        return await openCameraApplication();

      case 'CLOSE_CONTEXTUAL':
        return await closeContextualWindow();

      case 'CLOSE_ALL_APPLICATIONS':
        return await closeAllApplications();

      case 'CLOSE_NAMED_APP':
        return await closeNamedApplication(step.target || fullText);

      case 'SWITCH_APPLICATION':
        return await switchToApplicationWindow(step.target || fullText);

      default:
        // Use existing I.S.H.A application launch / web search / workspace file handler
        return handleDesktopCommandLegacy(fullText);
    }
  } catch (err) {
    console.error('Execution error in step:', err);
    return {
      success: false,
      intent: step.intent || 'ERROR',
      response: "I couldn't complete that operation.",
      status: 'FAILED',
    };
  }
}
