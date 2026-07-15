import { afterEach, describe, expect, test, vi } from 'vitest';

import { collectFocusableRoots, installInteractFocusContainment } from './focus-containment';

const dom = vi.hoisted(() => {
  interface Focusable {
    text: string;
    focus: () => void;
    matches: (selector: string) => boolean;
    isConnected: boolean;
  }

  interface Container {
    children: Focusable[];
    contains: (node: unknown) => boolean;
    matches: () => boolean;
    querySelectorAll: (selector: string) => Focusable[];
    isConnected: boolean;
    focus: () => void;
    tabIndex: number;
  }

  let active: Focusable | Container | null = null;
  const listeners = new Map<string, Set<(event: FocusEventLike) => void>>();

  interface FocusEventLike {
    target: unknown;
    preventDefault: () => void;
    stopPropagation: () => void;
    key?: string;
    shiftKey?: boolean;
    defaultPrevented: boolean;
  }

  function createFocusable(text: string): Focusable {
    const focusable: Focusable = {
      text,
      focus: vi.fn(function focusSelf() {
        active = focusable;
      }),
      matches(selector: string) {
        return selector.includes('button');
      },
      isConnected: true
    };
    return focusable;
  }

  function createContainer(): Container {
    const container: Container = {
      children: [],
      contains(node: unknown) {
        if (node === this) {
          return true;
        }
        return this.children.includes(node as Focusable);
      },
      matches() {
        return false;
      },
      querySelectorAll(selector: string) {
        if (!selector.includes('button')) {
          return [];
        }
        return this.children;
      },
      isConnected: true,
      focus: vi.fn(function focusContainer() {
        active = container;
      }),
      tabIndex: -1
    };
    return container;
  }

  return {
    active: () => active,
    reset() {
      active = null;
      listeners.clear();
    },
    createContainer,
    createFocusable,
    addEventListener(type: string, handler: (event: FocusEventLike) => void) {
      const handlers = listeners.get(type) ?? new Set();
      handlers.add(handler);
      listeners.set(type, handlers);
    },
    removeEventListener(type: string, handler: (event: FocusEventLike) => void) {
      listeners.get(type)?.delete(handler);
    },
    dispatch(type: string, init: { target?: unknown; key?: string; shiftKey?: boolean }) {
      const event: FocusEventLike = {
        target: init.target ?? active,
        key: init.key,
        shiftKey: init.shiftKey ?? false,
        defaultPrevented: false,
        preventDefault() {
          event.defaultPrevented = true;
        },
        stopPropagation() {
          /* noop */
        }
      };
      for (const handler of listeners.get(type) ?? []) {
        handler(event);
      }
      return event;
    }
  };
});

vi.mock('./focus', () => ({
  isFocusableElement: () => true
}));

vi.stubGlobal('document', {
  get activeElement() {
    return dom.active();
  },
  addEventListener: (...args: Parameters<typeof dom.addEventListener>) => dom.addEventListener(...args),
  removeEventListener: (...args: Parameters<typeof dom.removeEventListener>) => dom.removeEventListener(...args)
});

describe('focus containment helpers', () => {
  afterEach(function resetDom() {
    dom.reset();
  });

  test('collectFocusableRoots returns focusables from each root in order', () => {
    const card = dom.createContainer();
    const region = dom.createContainer();
    const cardButton = dom.createFocusable('card');
    const regionButton = dom.createFocusable('region');
    card.children.push(cardButton);
    region.children.push(regionButton);

    expect(collectFocusableRoots([card as never, region as never])).toEqual([cardButton, regionButton]);
  });

  test('installInteractFocusContainment redirects focus outside allowed roots', () => {
    const card = dom.createContainer();
    const region = dom.createContainer();
    const cardButton = dom.createFocusable('card');
    const outsider = dom.createFocusable('outside');
    card.children.push(cardButton);
    region.children.push(dom.createFocusable('region'));

    const dispose = installInteractFocusContainment({
      roots: [card as never, region as never],
      fallbackRoot: card as never
    });
    outsider.focus();
    dom.dispatch('focusin', { target: outsider });

    expect(cardButton.focus).toHaveBeenCalled();
    dispose();
  });

  test('Tab cycles from the last focusable back to the first', () => {
    const card = dom.createContainer();
    const region = dom.createContainer();
    const first = dom.createFocusable('first');
    const second = dom.createFocusable('second');
    card.children.push(first);
    region.children.push(second);

    const dispose = installInteractFocusContainment({
      roots: [card as never, region as never],
      fallbackRoot: card as never
    });
    second.focus();
    const event = dom.dispatch('keydown', { key: 'Tab' });

    expect(event.defaultPrevented).toBe(true);
    expect(first.focus).toHaveBeenCalled();
    dispose();
  });

  test('forward Tab from outside roots focuses the first focusable', () => {
    const card = dom.createContainer();
    const region = dom.createContainer();
    const first = dom.createFocusable('first');
    const outsider = dom.createFocusable('outside');
    card.children.push(first);
    region.children.push(dom.createFocusable('region'));

    const dispose = installInteractFocusContainment({
      roots: [card as never, region as never],
      fallbackRoot: card as never
    });
    outsider.focus();
    const event = dom.dispatch('keydown', { key: 'Tab' });

    expect(event.defaultPrevented).toBe(true);
    expect(first.focus).toHaveBeenCalled();
    dispose();
  });
});
