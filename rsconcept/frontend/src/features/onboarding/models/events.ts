import { type TourCardLayoutMode } from '../utils/card-position';

/** Stable browser event name for onboarding lifecycle signals. */
export const ONBOARDING_EVENT_NAME = 'portal:onboarding';

/** How the user entered or accepted a tour run. */
export type TourEntrySource = 'invitation' | 'manual' | 'menu';

/** Privacy-safe lifecycle event names (product metadata only). */
export type OnboardingEventName =
  | 'invitation_shown'
  | 'invitation_accepted'
  | 'invitation_not_now'
  | 'tour_started'
  | 'tour_restarted'
  | 'step_viewed'
  | 'subtour_entered'
  | 'anchor_unavailable'
  | 'anchor_retried'
  | 'action_completed'
  | 'skipped'
  | 'completed'
  | 'load_failed';

/**
 * CustomEvent detail for {@link ONBOARDING_EVENT_NAME}.
 * Never include content text, user IDs, item IDs, query strings, or error messages.
 */
export interface OnboardingEventDetail {
  name: OnboardingEventName;
  tourId: string;
  tourVersion: number;
  stepId?: string;
  stepIndex?: number;
  stepCount?: number;
  /** Pathname only — no search or hash. */
  route: string;
  locale: string;
  layout?: TourCardLayoutMode;
  source?: TourEntrySource;
  /** Matched `completeAction` id for `action_completed` events. */
  actionId?: string;
  timestamp: number;
}

export type OnboardingEventInput = Omit<OnboardingEventDetail, 'timestamp' | 'route'> & {
  /** Raw location; search/hash are stripped before emit. */
  route?: string;
  timestamp?: number;
};

export type OnboardingEventHandler = (detail: OnboardingEventDetail) => void;

const UUID_SEGMENT = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Strip query/hash and redact common dynamic ID segments. */
export function sanitizeOnboardingRoute(route: string | undefined | null): string {
  if (!route) {
    return '';
  }
  const trimmed = route.trim();
  if (!trimmed) {
    return '';
  }
  try {
    if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
      const url = new URL(trimmed);
      return redactRouteIDs(url.pathname);
    }
  } catch {
    // Fall through to path-only parsing.
  }
  const pathOnly = trimmed.split(/[?#]/, 1)[0] ?? '';
  const pathname = pathOnly.startsWith('/') ? pathOnly : pathOnly ? `/${pathOnly}` : '';
  return redactRouteIDs(pathname);
}

function redactRouteIDs(pathname: string): string {
  return pathname
    .split('/')
    .map(segment => (/^\d+$/.test(segment) || UUID_SEGMENT.test(segment) ? ':id' : segment))
    .join('/');
}

function canUseWindowEvents(): boolean {
  return typeof window !== 'undefined' && typeof window.dispatchEvent === 'function';
}

/** Normalize and validate a payload; returns null when required product fields are missing. */
export function normalizeOnboardingEvent(input: OnboardingEventInput): OnboardingEventDetail | null {
  const tourId = input.tourId?.trim();
  if (!tourId || !input.name) {
    return null;
  }
  if (!Number.isFinite(input.tourVersion) || input.tourVersion < 0) {
    return null;
  }
  const locale = input.locale?.trim();
  if (!locale) {
    return null;
  }

  const detail: OnboardingEventDetail = {
    name: input.name,
    tourId,
    tourVersion: input.tourVersion,
    route: sanitizeOnboardingRoute(input.route),
    locale,
    timestamp: input.timestamp ?? Date.now()
  };

  if (input.stepId !== undefined) {
    detail.stepId = input.stepId;
  }
  if (input.stepIndex !== undefined && Number.isFinite(input.stepIndex) && input.stepIndex >= 0) {
    detail.stepIndex = Math.floor(input.stepIndex);
  }
  if (input.stepCount !== undefined && Number.isFinite(input.stepCount) && input.stepCount >= 0) {
    detail.stepCount = Math.floor(input.stepCount);
  }
  if (input.layout) {
    detail.layout = input.layout;
  }
  if (input.source) {
    detail.source = input.source;
  }
  if (input.actionId !== undefined) {
    const actionId = input.actionId.trim();
    if (actionId) {
      detail.actionId = actionId;
    }
  }

  return detail;
}

/**
 * Emit a privacy-safe onboarding lifecycle event.
 * No-ops on the server and when the payload cannot be normalized.
 */
export function emitOnboardingEvent(input: OnboardingEventInput): OnboardingEventDetail | null {
  const detail = normalizeOnboardingEvent(input);
  if (!detail || !canUseWindowEvents()) {
    return detail;
  }
  window.dispatchEvent(new CustomEvent<OnboardingEventDetail>(ONBOARDING_EVENT_NAME, { detail }));
  return detail;
}

/** Subscribe to onboarding lifecycle events; returns an unsubscribe function. */
export function subscribeOnboardingEvents(handler: OnboardingEventHandler): () => void {
  if (!canUseWindowEvents()) {
    return function noopUnsubscribe() {
      /* SSR / non-DOM */
    };
  }

  function onEvent(event: Event) {
    const custom = event as CustomEvent<OnboardingEventDetail>;
    if (!custom.detail?.name || !custom.detail.tourId) {
      return;
    }
    handler(custom.detail);
  }

  window.addEventListener(ONBOARDING_EVENT_NAME, onEvent);
  return function unsubscribeOnboardingEvents() {
    window.removeEventListener(ONBOARDING_EVENT_NAME, onEvent);
  };
}

/**
 * Gate so each active tour step emits `step_viewed` once until the step identity changes.
 * Used by TourHost to avoid duplicates from re-renders, viewport bumps, or anchor retries.
 */
export function createStepViewGate() {
  let lastKey: string | null = null;

  return {
    /** @returns whether a new step_viewed should be emitted */
    shouldEmit(tourId: string, stepIndex: number): boolean {
      const key = `${tourId}:${stepIndex}`;
      if (lastKey === key) {
        return false;
      }
      lastKey = key;
      return true;
    },
    reset() {
      lastKey = null;
    }
  };
}
