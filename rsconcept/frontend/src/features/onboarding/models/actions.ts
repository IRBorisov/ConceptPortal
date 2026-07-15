/** Stable browser event name for onboarding practice action signals. */
export const ONBOARDING_ACTION_EVENT_NAME = 'portal:onboarding-action';

/** Stable ids emitted by product controls that can complete practice steps. */
export const OnboardingActionID = {
  CONSTITUENTS_SEARCH_USED: 'constituents-list.search-used',
  GRAPH_LABELS_TOGGLED: 'term-graph.labels-toggled'
} as const;

/**
 * Feature-emitted action payload. Product metadata only — no user ids, item ids, or content text.
 * TourHost matches `actionId` against the active interact step's `completeAction`.
 */
export interface OnboardingActionDetail {
  actionId: string;
  timestamp: number;
}

export type OnboardingActionHandler = (detail: OnboardingActionDetail) => void;

function canUseWindowEvents(): boolean {
  return typeof window !== 'undefined' && typeof window.dispatchEvent === 'function';
}

/** Normalize and validate an action id; returns null when the id is missing. */
export function normalizeOnboardingAction(
  actionId: string | undefined | null,
  timestamp?: number
): OnboardingActionDetail | null {
  const normalized = actionId?.trim();
  if (!normalized) {
    return null;
  }
  return {
    actionId: normalized,
    timestamp: timestamp ?? Date.now()
  };
}

/**
 * Emit a practice action signal. Features call this when the user completes the described action.
 * No-ops on the server and when the action id cannot be normalized.
 */
export function emitOnboardingAction(actionId: string, timestamp?: number): OnboardingActionDetail | null {
  const detail = normalizeOnboardingAction(actionId, timestamp);
  if (!detail || !canUseWindowEvents()) {
    return detail;
  }
  window.dispatchEvent(new CustomEvent<OnboardingActionDetail>(ONBOARDING_ACTION_EVENT_NAME, { detail }));
  return detail;
}

/** Subscribe to practice action signals; returns an unsubscribe function. */
export function subscribeOnboardingActions(handler: OnboardingActionHandler): () => void {
  if (!canUseWindowEvents()) {
    return function noopUnsubscribe() {
      /* SSR / non-DOM */
    };
  }

  function onEvent(event: Event) {
    const custom = event as CustomEvent<OnboardingActionDetail>;
    const detail = normalizeOnboardingAction(custom.detail?.actionId, custom.detail?.timestamp);
    if (!detail) {
      return;
    }
    handler(detail);
  }

  window.addEventListener(ONBOARDING_ACTION_EVENT_NAME, onEvent);
  return function unsubscribeOnboardingActions() {
    window.removeEventListener(ONBOARDING_ACTION_EVENT_NAME, onEvent);
  };
}
