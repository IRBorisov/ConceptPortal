const TRANSITION_ABORTED = 'Transition was aborted';

const ABORT_ERROR_NAMES = new Set(['InvalidStateError', 'TimeoutError', 'AbortError']);

function mentionsViewTransition(text: string): boolean {
  return text.toLowerCase().includes('view transition');
}

function hasTransitionAbortContext(text: string): boolean {
  return text.includes(TRANSITION_ABORTED) || mentionsViewTransition(text);
}

/** View Transitions API errors that are expected during navigation and should not be reported. */
export function isViewTransitionAbortError(error: unknown): boolean {
  if (typeof error === 'string') {
    return error.includes(TRANSITION_ABORTED) && mentionsViewTransition(error);
  }
  if (!(error instanceof Error)) {
    return false;
  }
  if (!ABORT_ERROR_NAMES.has(error.name)) {
    return false;
  }
  if (error.name === 'AbortError') {
    return mentionsViewTransition(error.message);
  }
  return hasTransitionAbortContext(error.message);
}

/** Swallow expected view-transition rejections from global handlers. */
export function handleViewTransitionAbortError(error: unknown): boolean {
  return isViewTransitionAbortError(error);
}

/** Absorb aborted view-transition promise rejections from programmatic navigation. */
export function absorbViewTransitionAbort(result: void | Promise<void>): void | Promise<void> {
  if (!result || typeof result.then !== 'function') {
    return result;
  }
  return result.catch(error => {
    if (!isViewTransitionAbortError(error)) {
      throw error;
    }
  });
}
