import { afterEach, describe, expect, test, vi } from 'vitest';

import { isFocusableElement, restoreFocusSafely } from './focus';

const dom = vi.hoisted(() => {
  let contains = true;
  let inertAncestor: Element | null = null;
  let disabled = false;
  let display = 'block';
  let visibility = 'visible';
  let matchesResult = true;
  const focus = vi.fn();

  let clientRectCount = 1;

  const element = {
    focus,
    matches(selector: string) {
      if (selector === ':disabled') {
        return disabled;
      }
      if (selector.startsWith('a[href], button')) {
        return matchesResult;
      }
      return false;
    },
    closest(selector: string) {
      return selector === '[inert]' ? inertAncestor : null;
    },
    hasAttribute() {
      return false;
    },
    getClientRects() {
      return { length: clientRectCount } as DOMRectList;
    }
  } as unknown as HTMLElement;

  return {
    element,
    focus,
    reset() {
      contains = true;
      inertAncestor = null;
      disabled = false;
      display = 'block';
      visibility = 'visible';
      matchesResult = true;
      clientRectCount = 1;
      focus.mockClear();
    },
    setContains(value: boolean) {
      contains = value;
    },
    setInertAncestor(value: Element | null) {
      inertAncestor = value;
    },
    setDisabled(value: boolean) {
      disabled = value;
    },
    setHidden(value: boolean) {
      display = value ? 'none' : 'block';
      visibility = value ? 'hidden' : 'visible';
    },
    setAncestorHidden(value: boolean) {
      clientRectCount = value ? 0 : 1;
    },
    setMatchesResult(value: boolean) {
      matchesResult = value;
    },
    contains() {
      return contains;
    },
    getComputedStyle() {
      return { display, visibility } as CSSStyleDeclaration;
    }
  };
});

vi.stubGlobal('document', {
  contains(element: HTMLElement) {
    return dom.contains() && element === dom.element;
  },
  getElementById() {
    return null;
  }
});

vi.stubGlobal('window', {
  getComputedStyle() {
    return dom.getComputedStyle();
  }
});

describe('focus helpers', () => {
  afterEach(function resetDomMocks() {
    dom.reset();
  });

  test('restoreFocusSafely skips disconnected targets', () => {
    dom.setContains(false);

    restoreFocusSafely(dom.element);

    expect(dom.focus).not.toHaveBeenCalled();
  });

  test('restoreFocusSafely skips targets inside an inert subtree', () => {
    dom.setInertAncestor({} as Element);

    restoreFocusSafely(dom.element);

    expect(dom.focus).not.toHaveBeenCalled();
  });

  test('restoreFocusSafely focuses a visible, connected target', () => {
    restoreFocusSafely(dom.element);

    expect(dom.focus).toHaveBeenCalledOnce();
  });

  test('isFocusableElement rejects hidden controls', () => {
    dom.setHidden(true);

    expect(isFocusableElement(dom.element)).toBe(false);
  });

  test('restoreFocusSafely skips targets hidden by an ancestor', () => {
    dom.setAncestorHidden(true);

    restoreFocusSafely(dom.element);

    expect(dom.focus).not.toHaveBeenCalled();
  });
});
