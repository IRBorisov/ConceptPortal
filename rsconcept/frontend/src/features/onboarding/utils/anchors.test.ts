import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { findVisibleAnchorElement, isAnchorVisible, rectsAlmostEqual, waitForAnchorElement } from './anchors';

const dom = vi.hoisted(() => {
  let queryResults: HTMLElement[] = [];
  const getComputedStyle = vi.fn(
    () =>
      ({
        display: 'block',
        visibility: 'visible',
        opacity: '1'
      }) as CSSStyleDeclaration
  );

  return {
    get queryResults() {
      return queryResults;
    },
    set queryResults(value: HTMLElement[]) {
      queryResults = value;
    },
    getComputedStyle,
    querySelectorAll: vi.fn(() => queryResults)
  };
});

function mockVisibleElement(width = 40, height = 20): HTMLElement {
  return {
    isConnected: true,
    getBoundingClientRect: () =>
      ({
        width,
        height,
        top: 0,
        left: 0,
        right: width,
        bottom: height
      }) as DOMRect
  } as HTMLElement;
}

beforeEach(() => {
  dom.queryResults = [];
  dom.getComputedStyle.mockReturnValue({
    display: 'block',
    visibility: 'visible',
    opacity: '1'
  } as CSSStyleDeclaration);

  vi.stubGlobal('window', { getComputedStyle: dom.getComputedStyle });
  vi.stubGlobal('document', {
    querySelectorAll: dom.querySelectorAll,
    body: {}
  });
  vi.stubGlobal(
    'MutationObserver',
    class {
      observe() {
        return undefined;
      }
      disconnect() {
        return undefined;
      }
    }
  );
  vi.stubGlobal('performance', { now: () => Date.now() });
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    setTimeout(() => callback(0), 0);
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('isAnchorVisible', () => {
  test('returns false for disconnected elements', () => {
    expect(isAnchorVisible({ isConnected: false } as HTMLElement)).toBe(false);
  });

  test('returns false for hidden or zero-size elements', () => {
    dom.getComputedStyle.mockReturnValue({
      display: 'none',
      visibility: 'visible',
      opacity: '1'
    } as CSSStyleDeclaration);
    expect(isAnchorVisible(mockVisibleElement())).toBe(false);
    expect(isAnchorVisible(mockVisibleElement(0, 0))).toBe(false);
  });

  test('returns true for visible connected elements', () => {
    expect(isAnchorVisible(mockVisibleElement())).toBe(true);
  });
});

describe('findVisibleAnchorElement', () => {
  test('returns null until a visible anchor is found', () => {
    expect(findVisibleAnchorElement('toolbar')).toBeNull();

    dom.queryResults = [mockVisibleElement()];
    expect(findVisibleAnchorElement('toolbar')).not.toBeNull();
  });

  test('skips hidden duplicates and returns the first visible anchor', () => {
    const hidden = mockVisibleElement(0, 0);
    const visible = mockVisibleElement();
    dom.queryResults = [hidden, visible];

    expect(findVisibleAnchorElement('toolbar')).toBe(visible);
  });
});

describe('waitForAnchorElement', () => {
  test('resolves null after timeout when anchor stays missing', async () => {
    vi.useFakeTimers();
    const promise = waitForAnchorElement('missing', 100);
    await vi.advanceTimersByTimeAsync(200);
    await expect(promise).resolves.toBeNull();
  });

  test('aborts immediately when the signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(waitForAnchorElement('panel', 5000, controller.signal)).resolves.toBeNull();
  });
});

describe('rectsAlmostEqual', () => {
  test('compares rects within tolerance', () => {
    const rect = { top: 1, left: 2, width: 3, height: 4 } as DOMRect;
    expect(rectsAlmostEqual(rect, { top: 1, left: 2, width: 3, height: 4 } as DOMRect)).toBe(true);
    expect(rectsAlmostEqual(rect, { top: 2, left: 2, width: 3, height: 4 } as DOMRect)).toBe(false);
  });
});
