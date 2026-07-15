import { describe, expect, test } from 'vitest';

import {
  CARD_MARGIN,
  CARD_OFFSET,
  CARD_WIDTH,
  computeBottomSheetPosition,
  computeCardPosition,
  computeCenteredCardPosition,
  ESTIMATED_CARD_HEIGHT,
  isNarrowLayout,
  type LayoutViewport,
  NARROW_VIEWPORT_WIDTH
} from './card-position';

const VIEWPORT: LayoutViewport = {
  width: 1280,
  height: 720,
  offsetLeft: 0,
  offsetTop: 0,
  safeAreaTop: 0,
  safeAreaRight: 0,
  safeAreaBottom: 0,
  safeAreaLeft: 0
};

function rect(top: number, left: number, width: number, height: number) {
  return { top, left, right: left + width, bottom: top + height, width, height };
}

describe('computeCardPosition', () => {
  test('places the card above a small anchor when top placement is requested', () => {
    const anchor = rect(400, 100, 200, 40);
    const position = computeCardPosition(anchor, 'top', ESTIMATED_CARD_HEIGHT, VIEWPORT);

    expect(position.top + ESTIMATED_CARD_HEIGHT).toBeLessThanOrEqual(anchor.top);
    expect(position.top).toBeGreaterThanOrEqual(CARD_MARGIN);
  });

  test('keeps the card on screen for a viewport-tall table anchor', () => {
    const anchor = rect(120, 40, 1200, 600);
    const position = computeCardPosition(anchor, 'top', ESTIMATED_CARD_HEIGHT, VIEWPORT);

    expect(position.top).toBeGreaterThanOrEqual(CARD_MARGIN);
    expect(position.top + ESTIMATED_CARD_HEIGHT).toBeLessThanOrEqual(VIEWPORT.height - CARD_MARGIN);
  });

  test('does not place the card below the viewport when top placement cannot fit above', () => {
    const anchor = rect(80, 40, 1200, 620);
    const position = computeCardPosition(anchor, 'top', ESTIMATED_CARD_HEIGHT, VIEWPORT);

    expect(position.top + ESTIMATED_CARD_HEIGHT).toBeLessThanOrEqual(VIEWPORT.height - CARD_MARGIN);
  });

  test('places the card below a small anchor when bottom placement is requested', () => {
    const anchor = rect(100, 400, 200, 40);
    const position = computeCardPosition(anchor, 'bottom', ESTIMATED_CARD_HEIGHT, VIEWPORT);

    expect(position.top).toBeGreaterThanOrEqual(anchor.bottom + CARD_OFFSET);
    expect(position.left).toBeGreaterThanOrEqual(CARD_MARGIN);
    expect(position.left + CARD_WIDTH).toBeLessThanOrEqual(VIEWPORT.width - CARD_MARGIN);
    expect(position.top + ESTIMATED_CARD_HEIGHT).toBeLessThanOrEqual(VIEWPORT.height - CARD_MARGIN);
  });

  test('keeps the card on screen for bottom placement when there is no room below', () => {
    const anchor = rect(580, 400, 200, 80);
    const position = computeCardPosition(anchor, 'bottom', ESTIMATED_CARD_HEIGHT, VIEWPORT);

    expect(position.top).toBeGreaterThanOrEqual(CARD_MARGIN);
    expect(position.top + ESTIMATED_CARD_HEIGHT).toBeLessThanOrEqual(VIEWPORT.height - CARD_MARGIN);
    expect(position.top + ESTIMATED_CARD_HEIGHT).toBeLessThanOrEqual(anchor.top);
  });

  test('places the card to the left of the anchor when left placement is requested', () => {
    const anchor = rect(200, 500, 80, 40);
    const position = computeCardPosition(anchor, 'left', ESTIMATED_CARD_HEIGHT, VIEWPORT);

    expect(position.left + CARD_WIDTH).toBeLessThanOrEqual(anchor.left - CARD_OFFSET);
    expect(position.left).toBeGreaterThanOrEqual(CARD_MARGIN);
    expect(position.left + CARD_WIDTH).toBeLessThanOrEqual(VIEWPORT.width - CARD_MARGIN);
    expect(position.top).toBeGreaterThanOrEqual(CARD_MARGIN);
    expect(position.top + ESTIMATED_CARD_HEIGHT).toBeLessThanOrEqual(VIEWPORT.height - CARD_MARGIN);
  });

  test('falls back to the right when left placement cannot fit on the left', () => {
    const anchor = rect(200, 20, 80, 40);
    const position = computeCardPosition(anchor, 'left', ESTIMATED_CARD_HEIGHT, VIEWPORT);

    expect(position.left).toBeGreaterThanOrEqual(anchor.right + CARD_OFFSET);
    expect(position.left).toBeGreaterThanOrEqual(CARD_MARGIN);
    expect(position.left + CARD_WIDTH).toBeLessThanOrEqual(VIEWPORT.width - CARD_MARGIN);
  });

  test('places the card to the right of the anchor when right placement is requested', () => {
    const anchor = rect(200, 100, 80, 40);
    const position = computeCardPosition(anchor, 'right', ESTIMATED_CARD_HEIGHT, VIEWPORT);

    expect(position.left).toBeGreaterThanOrEqual(anchor.right + CARD_OFFSET);
    expect(position.left).toBeGreaterThanOrEqual(CARD_MARGIN);
    expect(position.left + CARD_WIDTH).toBeLessThanOrEqual(VIEWPORT.width - CARD_MARGIN);
    expect(position.top).toBeGreaterThanOrEqual(CARD_MARGIN);
    expect(position.top + ESTIMATED_CARD_HEIGHT).toBeLessThanOrEqual(VIEWPORT.height - CARD_MARGIN);
  });

  test('falls back to the left when right placement cannot fit on the right', () => {
    const anchor = rect(200, 1180, 80, 40);
    const position = computeCardPosition(anchor, 'right', ESTIMATED_CARD_HEIGHT, VIEWPORT);

    expect(position.left + CARD_WIDTH).toBeLessThanOrEqual(anchor.left - CARD_OFFSET);
    expect(position.left).toBeGreaterThanOrEqual(CARD_MARGIN);
    expect(position.left + CARD_WIDTH).toBeLessThanOrEqual(VIEWPORT.width - CARD_MARGIN);
  });

  test('vertically aligns beside-anchor placement with the anchor top when possible', () => {
    const anchor = rect(200, 500, 80, 40);
    const position = computeCardPosition(anchor, 'left', ESTIMATED_CARD_HEIGHT, VIEWPORT);

    expect(position.top).toBe(anchor.top);
  });

  test('clamps anchored placement inside a shifted visual viewport', () => {
    const anchor = rect(120, 40, 200, 40);
    const shiftedViewport: LayoutViewport = {
      ...VIEWPORT,
      width: 360,
      height: 640,
      offsetLeft: 0,
      offsetTop: 80
    };
    const position = computeCardPosition(anchor, 'bottom', ESTIMATED_CARD_HEIGHT, shiftedViewport);

    expect(position.top).toBeGreaterThanOrEqual(shiftedViewport.offsetTop + CARD_MARGIN);
    expect(position.top + ESTIMATED_CARD_HEIGHT).toBeLessThanOrEqual(
      shiftedViewport.offsetTop + shiftedViewport.height - CARD_MARGIN
    );
  });
});

describe('computeCenteredCardPosition', () => {
  test('centers the card in the viewport', () => {
    const position = computeCenteredCardPosition(ESTIMATED_CARD_HEIGHT, VIEWPORT);

    expect(position.left).toBe((VIEWPORT.width - CARD_WIDTH) / 2);
    expect(position.top).toBe((VIEWPORT.height - ESTIMATED_CARD_HEIGHT) / 2);
  });

  test('centers inside a shifted visual viewport', () => {
    const shiftedViewport: LayoutViewport = {
      width: 390,
      height: 700,
      offsetLeft: 0,
      offsetTop: 44,
      safeAreaTop: 0,
      safeAreaRight: 0,
      safeAreaBottom: 34,
      safeAreaLeft: 0
    };
    const position = computeCenteredCardPosition(ESTIMATED_CARD_HEIGHT, shiftedViewport);

    expect(position.top).toBeGreaterThanOrEqual(shiftedViewport.offsetTop + CARD_MARGIN);
    expect(position.top + ESTIMATED_CARD_HEIGHT).toBeLessThanOrEqual(
      shiftedViewport.offsetTop + shiftedViewport.height - CARD_MARGIN - shiftedViewport.safeAreaBottom
    );
  });
});

describe('computeBottomSheetPosition', () => {
  test('pins the card to the bottom of the visible viewport', () => {
    const narrowViewport: LayoutViewport = {
      width: 390,
      height: 844,
      offsetLeft: 0,
      offsetTop: 0,
      safeAreaTop: 0,
      safeAreaRight: 0,
      safeAreaBottom: 34,
      safeAreaLeft: 0
    };
    const position = computeBottomSheetPosition(ESTIMATED_CARD_HEIGHT, narrowViewport);
    const maxTop =
      narrowViewport.offsetTop +
      narrowViewport.height -
      ESTIMATED_CARD_HEIGHT -
      CARD_MARGIN -
      narrowViewport.safeAreaBottom;

    expect(position.top).toBe(maxTop);
    expect(position.left).toBeGreaterThanOrEqual(CARD_MARGIN);
    expect(position.width).toBe(Math.min(CARD_WIDTH, narrowViewport.width - 2 * CARD_MARGIN));
  });

  test('honors horizontal safe-area insets when sizing the sheet', () => {
    const landscapeViewport: LayoutViewport = {
      width: 844,
      height: 390,
      offsetLeft: 0,
      offsetTop: 0,
      safeAreaTop: 0,
      safeAreaRight: 44,
      safeAreaBottom: 21,
      safeAreaLeft: 44
    };
    const position = computeBottomSheetPosition(ESTIMATED_CARD_HEIGHT, landscapeViewport);
    const expectedWidth = Math.min(CARD_WIDTH, landscapeViewport.width - 2 * CARD_MARGIN);

    expect(position.width).toBe(expectedWidth);
    expect(position.left).toBeGreaterThanOrEqual(CARD_MARGIN + landscapeViewport.safeAreaLeft);
    expect(position.left + expectedWidth).toBeLessThanOrEqual(
      landscapeViewport.width - CARD_MARGIN - landscapeViewport.safeAreaRight
    );
  });
});

describe('isNarrowLayout', () => {
  test('treats viewports below the breakpoint as narrow', () => {
    expect(isNarrowLayout({ ...VIEWPORT, width: NARROW_VIEWPORT_WIDTH - 1 })).toBe(true);
    expect(isNarrowLayout({ ...VIEWPORT, width: NARROW_VIEWPORT_WIDTH })).toBe(false);
  });
});
