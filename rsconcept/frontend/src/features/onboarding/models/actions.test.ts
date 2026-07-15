import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
  emitOnboardingAction,
  normalizeOnboardingAction,
  ONBOARDING_ACTION_EVENT_NAME,
  subscribeOnboardingActions
} from './actions';

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
}

describe('normalizeOnboardingAction', () => {
  test('trims and rejects empty action ids', () => {
    expect(normalizeOnboardingAction('  engine-fixture.complete  ')).toMatchObject({
      actionId: 'engine-fixture.complete'
    });
    expect(normalizeOnboardingAction('   ')).toBeNull();
    expect(normalizeOnboardingAction(undefined)).toBeNull();
  });
});

describe('emitOnboardingAction and subscribeOnboardingActions', () => {
  beforeEach(() => {
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

  test('dispatches action events to subscribers', () => {
    const received: string[] = [];
    const unsubscribe = subscribeOnboardingActions(detail => {
      received.push(detail.actionId);
    });

    emitOnboardingAction('engine-fixture.complete', 99);
    expect(received).toEqual(['engine-fixture.complete']);

    unsubscribe();
    emitOnboardingAction('engine-fixture.complete');
    expect(received).toHaveLength(1);
  });

  test('ignores malformed action payloads', () => {
    const received: string[] = [];
    subscribeOnboardingActions(detail => {
      received.push(detail.actionId);
    });

    window.dispatchEvent(
      new CustomEvent(ONBOARDING_ACTION_EVENT_NAME, { detail: { actionId: '  ', timestamp: 1 } })
    );
    expect(received).toHaveLength(0);
  });

  test('is SSR-safe when window is unavailable', () => {
    vi.stubGlobal('window', undefined);
    expect(emitOnboardingAction('engine-fixture.complete')).toMatchObject({
      actionId: 'engine-fixture.complete'
    });
    const unsubscribe = subscribeOnboardingActions(() => undefined);
    unsubscribe();
  });
});
