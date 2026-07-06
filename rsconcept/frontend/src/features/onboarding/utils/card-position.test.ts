import { describe, expect, test } from 'vitest';

import {
  CARD_MARGIN,
  CARD_OFFSET,
  CARD_WIDTH,
  computeCardPosition,
  computeCenteredCardPosition,
  ESTIMATED_CARD_HEIGHT
} from './card-position';

const VIEWPORT = { width: 1280, height: 720 };

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
});

describe('computeCenteredCardPosition', () => {
  test('centers the card in the viewport', () => {
    const position = computeCenteredCardPosition(ESTIMATED_CARD_HEIGHT, VIEWPORT);

    expect(position.left).toBe((VIEWPORT.width - CARD_WIDTH) / 2);
    expect(position.top).toBe((VIEWPORT.height - ESTIMATED_CARD_HEIGHT) / 2);
  });
});
