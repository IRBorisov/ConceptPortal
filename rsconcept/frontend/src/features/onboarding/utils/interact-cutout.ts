export interface ViewportSize {
  width: number;
  height: number;
  offsetLeft?: number;
  offsetTop?: number;
}

export interface CutoutRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface CutoutPanelRects {
  top: CutoutRect;
  left: CutoutRect;
  right: CutoutRect;
  bottom: CutoutRect;
}

/** Expand a target rect by padding and clamp to the viewport. */
export function expandRectToCutout(rect: DOMRect, padding: number, viewport: ViewportSize): CutoutRect {
  const viewportLeft = viewport.offsetLeft ?? 0;
  const viewportTop = viewport.offsetTop ?? 0;
  const viewportRight = viewportLeft + viewport.width;
  const viewportBottom = viewportTop + viewport.height;
  const top = Math.max(viewportTop, rect.top - padding);
  const left = Math.max(viewportLeft, rect.left - padding);
  const right = Math.min(viewportRight, rect.right + padding);
  const bottom = Math.min(viewportBottom, rect.bottom + padding);
  return {
    top,
    left,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top)
  };
}

/** Four fixed panels that dim everything outside the cutout hole. */
export function computeCutoutPanelRects(cutout: CutoutRect, viewport: ViewportSize): CutoutPanelRects {
  const viewportLeft = viewport.offsetLeft ?? 0;
  const viewportTop = viewport.offsetTop ?? 0;
  const viewportRight = viewportLeft + viewport.width;
  const viewportBottom = viewportTop + viewport.height;
  const cutoutRight = cutout.left + cutout.width;
  const cutoutBottom = cutout.top + cutout.height;

  return {
    top: {
      top: viewportTop,
      left: viewportLeft,
      width: viewport.width,
      height: Math.max(0, cutout.top - viewportTop)
    },
    left: {
      top: cutout.top,
      left: viewportLeft,
      width: Math.max(0, cutout.left - viewportLeft),
      height: cutout.height
    },
    right: {
      top: cutout.top,
      left: cutoutRight,
      width: Math.max(0, viewportRight - cutoutRight),
      height: cutout.height
    },
    bottom: {
      top: cutoutBottom,
      left: viewportLeft,
      width: viewport.width,
      height: Math.max(0, viewportBottom - cutoutBottom)
    }
  };
}

/** True when a viewport point lies inside the cutout (inclusive). */
export function isPointInsideCutout(x: number, y: number, cutout: CutoutRect): boolean {
  return x >= cutout.left && x <= cutout.left + cutout.width && y >= cutout.top && y <= cutout.top + cutout.height;
}
