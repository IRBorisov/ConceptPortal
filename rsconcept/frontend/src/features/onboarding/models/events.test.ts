import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
  createStepViewGate,
  emitOnboardingEvent,
  normalizeOnboardingEvent,
  ONBOARDING_EVENT_NAME,
  type OnboardingEventDetail,
  sanitizeOnboardingRoute,
  subscribeOnboardingEvents
} from './events';

/** Minimal EventTarget stand-in so lifecycle tests work without jsdom. */
function installWindowEventTarget() {
  const listeners = new Map<string, Set<EventListener>>();

  const windowStub = {
    dispatchEvent(event: Event) {
      const handlers = listeners.get(event.type);
      if (!handlers) {
        return true;
      }
      for (const handler of handlers) {
        handler(event);
      }
      return true;
    },
    addEventListener(type: string, listener: EventListener) {
      const handlers = listeners.get(type) ?? new Set();
      handlers.add(listener);
      listeners.set(type, handlers);
    },
    removeEventListener(type: string, listener: EventListener) {
      listeners.get(type)?.delete(listener);
    }
  };

  vi.stubGlobal('window', windowStub);
  return windowStub;
}

describe('sanitizeOnboardingRoute', () => {
  test('keeps pathname and strips query and hash', () => {
    expect(sanitizeOnboardingRoute('/rsforms/12?tab=1#focus')).toBe('/rsforms/:id');
    expect(sanitizeOnboardingRoute('/library')).toBe('/library');
  });

  test('parses absolute URLs and redacts numeric or UUID item ids', () => {
    expect(sanitizeOnboardingRoute('https://example.test/models/9?x=1')).toBe('/models/:id');
    expect(sanitizeOnboardingRoute('/oss/550e8400-e29b-41d4-a716-446655440000')).toBe('/oss/:id');
  });

  test('returns empty string for missing input', () => {
    expect(sanitizeOnboardingRoute(undefined)).toBe('');
    expect(sanitizeOnboardingRoute('')).toBe('');
  });
});

describe('normalizeOnboardingEvent', () => {
  test('builds a privacy-safe detail payload', () => {
    const detail = normalizeOnboardingEvent({
      name: 'step_viewed',
      tourId: 'sandbox-intro',
      tourVersion: 7,
      stepId: 'welcome',
      stepIndex: 0,
      stepCount: 5,
      route: '/sandbox?bundle=secret',
      locale: 'en',
      layout: 'centered',
      source: 'invitation',
      timestamp: 1_700_000_000_000
    });

    expect(detail).toEqual({
      name: 'step_viewed',
      tourId: 'sandbox-intro',
      tourVersion: 7,
      stepId: 'welcome',
      stepIndex: 0,
      stepCount: 5,
      route: '/sandbox',
      locale: 'en',
      layout: 'centered',
      source: 'invitation',
      timestamp: 1_700_000_000_000
    });
  });

  test('rejects missing tour id, name, locale, or invalid version', () => {
    expect(
      normalizeOnboardingEvent({
        name: 'completed',
        tourId: '  ',
        tourVersion: 1,
        locale: 'en'
      })
    ).toBeNull();
    expect(
      normalizeOnboardingEvent({
        name: 'completed',
        tourId: 'sandbox-intro',
        tourVersion: -1,
        locale: 'en'
      })
    ).toBeNull();
    expect(
      normalizeOnboardingEvent({
        name: 'completed',
        tourId: 'sandbox-intro',
        tourVersion: 1,
        locale: ''
      })
    ).toBeNull();
  });

  test('includes actionId on action_completed events', () => {
    const detail = normalizeOnboardingEvent({
      name: 'action_completed',
      tourId: 'engine-fixture',
      tourVersion: 1,
      locale: 'en',
      route: '/sandbox',
      stepId: 'interact',
      stepIndex: 1,
      actionId: 'engine-fixture.complete'
    });

    expect(detail?.actionId).toBe('engine-fixture.complete');
  });

  test('omits undefined optional fields and never requires content text', () => {
    const detail = normalizeOnboardingEvent({
      name: 'invitation_shown',
      tourId: 'library-intro',
      tourVersion: 1,
      locale: 'ru',
      route: '/library'
    });

    expect(detail).toMatchObject({
      name: 'invitation_shown',
      tourId: 'library-intro',
      tourVersion: 1,
      locale: 'ru',
      route: '/library'
    });
    expect(detail).not.toHaveProperty('stepId');
    expect(detail).not.toHaveProperty('source');
    expect(detail).not.toHaveProperty('layout');
    expect(JSON.stringify(detail)).not.toMatch(/title|body|error|user/i);
  });
});

describe('emitOnboardingEvent and subscribeOnboardingEvents', () => {
  const received: OnboardingEventDetail[] = [];

  beforeEach(() => {
    received.length = 0;
    installWindowEventTarget();
    if (typeof CustomEvent === 'undefined') {
      class TestCustomEvent<T> extends Event {
        detail: T;
        constructor(type: string, init?: CustomEventInit<T>) {
          super(type, init);
          this.detail = init?.detail as T;
        }
      }
      vi.stubGlobal('CustomEvent', TestCustomEvent);
    }
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('dispatches a CustomEvent and delivers the same detail to subscribers', () => {
    const unsubscribe = subscribeOnboardingEvents(detail => {
      received.push(detail);
    });

    const detail = emitOnboardingEvent({
      name: 'tour_started',
      tourId: 'sandbox-intro',
      tourVersion: 7,
      locale: 'en',
      route: '/sandbox',
      source: 'invitation',
      timestamp: 42
    });

    expect(detail?.name).toBe('tour_started');
    expect(received).toHaveLength(1);
    expect(received[0]).toEqual(detail);

    const nativeReceived: OnboardingEventDetail[] = [];
    window.addEventListener(ONBOARDING_EVENT_NAME, (event: Event) => {
      nativeReceived.push((event as CustomEvent<OnboardingEventDetail>).detail);
    });

    emitOnboardingEvent({
      name: 'completed',
      tourId: 'sandbox-intro',
      tourVersion: 7,
      locale: 'en',
      route: '/sandbox',
      timestamp: 43
    });

    expect(nativeReceived).toHaveLength(1);
    expect(nativeReceived[0]?.name).toBe('completed');
    expect(received).toHaveLength(2);

    unsubscribe();
    emitOnboardingEvent({
      name: 'skipped',
      tourId: 'sandbox-intro',
      tourVersion: 7,
      locale: 'en',
      route: '/sandbox',
      timestamp: 44
    });
    expect(received).toHaveLength(2);
  });

  test('is SSR-safe when window is unavailable', () => {
    vi.stubGlobal('window', undefined);

    expect(
      emitOnboardingEvent({
        name: 'load_failed',
        tourId: 'sandbox-intro',
        tourVersion: 0,
        locale: 'en',
        route: '/sandbox'
      })
    ).toMatchObject({ name: 'load_failed', tourId: 'sandbox-intro' });

    const unsubscribe = subscribeOnboardingEvents(() => {
      received.push({
        name: 'load_failed',
        tourId: 'x',
        tourVersion: 0,
        route: '',
        locale: 'en',
        timestamp: 0
      });
    });
    unsubscribe();
    expect(received).toHaveLength(0);
  });
});

describe('createStepViewGate', () => {
  test('emits once per tour step and again after the step identity changes', () => {
    const gate = createStepViewGate();

    expect(gate.shouldEmit('sandbox-intro', 0)).toBe(true);
    expect(gate.shouldEmit('sandbox-intro', 0)).toBe(false);
    expect(gate.shouldEmit('sandbox-intro', 0)).toBe(false);
    expect(gate.shouldEmit('sandbox-intro', 1)).toBe(true);
    expect(gate.shouldEmit('sandbox-intro', 1)).toBe(false);
    expect(gate.shouldEmit('constituents-list', 0)).toBe(true);

    gate.reset();
    expect(gate.shouldEmit('sandbox-intro', 0)).toBe(true);
  });

  test('integration: step_viewed is not duplicated for retries or re-renders of the same step', () => {
    installWindowEventTarget();
    if (typeof CustomEvent === 'undefined') {
      class TestCustomEvent<T> extends Event {
        detail: T;
        constructor(type: string, init?: CustomEventInit<T>) {
          super(type, init);
          this.detail = init?.detail as T;
        }
      }
      vi.stubGlobal('CustomEvent', TestCustomEvent);
    }

    const gate = createStepViewGate();
    const viewed: string[] = [];
    const unsubscribe = subscribeOnboardingEvents(detail => {
      if (detail.name === 'step_viewed') {
        viewed.push(`${detail.tourId}:${detail.stepIndex}`);
      }
    });

    function noteStep(tourId: string, stepIndex: number) {
      if (!gate.shouldEmit(tourId, stepIndex)) {
        return;
      }
      emitOnboardingEvent({
        name: 'step_viewed',
        tourId,
        tourVersion: 1,
        stepIndex,
        stepCount: 3,
        locale: 'en',
        route: '/sandbox',
        layout: 'anchored'
      });
    }

    noteStep('sandbox-intro', 0);
    noteStep('sandbox-intro', 0); // re-render
    noteStep('sandbox-intro', 0); // anchor retry
    noteStep('sandbox-intro', 1);
    noteStep('sandbox-intro', 1);

    expect(viewed).toEqual(['sandbox-intro:0', 'sandbox-intro:1']);
    unsubscribe();
    vi.unstubAllGlobals();
  });
});
