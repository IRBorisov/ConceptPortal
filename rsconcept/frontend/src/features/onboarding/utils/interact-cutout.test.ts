import { describe, expect, test } from 'vitest';

import { computeCutoutPanelRects, expandRectToCutout, isPointInsideCutout } from './interact-cutout';

describe('interact cutout geometry', () => {
  const viewport = { width: 800, height: 600 };

  test('expandRectToCutout pads and clamps to the viewport', () => {
    const cutout = expandRectToCutout(
      { top: 100, left: 200, right: 400, bottom: 250, width: 200, height: 150 } as DOMRect,
      6,
      viewport
    );

    expect(cutout).toEqual({ top: 94, left: 194, width: 212, height: 162 });
  });

  test('computeCutoutPanelRects surrounds the hole with four panels', () => {
    const cutout = { top: 100, left: 200, width: 200, height: 150 };
    const panels = computeCutoutPanelRects(cutout, viewport);

    expect(panels.top).toEqual({ top: 0, left: 0, width: 800, height: 100 });
    expect(panels.left).toEqual({ top: 100, left: 0, width: 200, height: 150 });
    expect(panels.right).toEqual({ top: 100, left: 400, width: 400, height: 150 });
    expect(panels.bottom).toEqual({ top: 250, left: 0, width: 800, height: 350 });
  });

  test('uses visual viewport offsets when zoomed or shifted', () => {
    const shiftedViewport = { width: 400, height: 300, offsetLeft: 40, offsetTop: 60 };
    const cutout = expandRectToCutout(
      { top: 100, left: 120, right: 220, bottom: 180, width: 100, height: 80 } as DOMRect,
      0,
      shiftedViewport
    );
    const panels = computeCutoutPanelRects(cutout, shiftedViewport);

    expect(panels.top).toEqual({ top: 60, left: 40, width: 400, height: 40 });
    expect(panels.left).toEqual({ top: 100, left: 40, width: 80, height: 80 });
    expect(panels.right).toEqual({ top: 100, left: 220, width: 220, height: 80 });
    expect(panels.bottom).toEqual({ top: 180, left: 40, width: 400, height: 180 });
  });

  test('isPointInsideCutout matches inclusive bounds', () => {
    const cutout = { top: 10, left: 20, width: 30, height: 40 };
    expect(isPointInsideCutout(25, 20, cutout)).toBe(true);
    expect(isPointInsideCutout(19, 20, cutout)).toBe(false);
    expect(isPointInsideCutout(50, 50, cutout)).toBe(true);
    expect(isPointInsideCutout(51, 50, cutout)).toBe(false);
  });
});
