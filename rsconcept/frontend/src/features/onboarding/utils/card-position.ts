import { type TourPlacement } from '../models/tour';

export const CARD_OFFSET = 12;
export const CARD_WIDTH = 400;
export const CARD_MARGIN = 8;
export const ESTIMATED_CARD_HEIGHT = 300;
/** Viewports narrower than this use a bottom-sheet tour card layout. */
export const NARROW_VIEWPORT_WIDTH = 640;

export interface AnchorRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface LayoutViewport {
  width: number;
  height: number;
  offsetLeft: number;
  offsetTop: number;
  safeAreaTop: number;
  safeAreaRight: number;
  safeAreaBottom: number;
  safeAreaLeft: number;
}

/** @deprecated Use {@link LayoutViewport}. */
export type ViewportSize = LayoutViewport;

export interface CardPosition {
  left: number;
  top: number;
  /** Explicit width when the layout supplies it (bottom-sheet). */
  width?: number;
}

export type TourCardLayoutMode = 'anchored' | 'centered' | 'bottom-sheet';

/** Reads the visible layout viewport, including visual-viewport offset and safe-area insets. */
export function readLayoutViewport(): LayoutViewport {
  if (typeof window === 'undefined') {
    return defaultLayoutViewport(1280, 720);
  }
  const visualViewport = window.visualViewport;
  const safeArea = readSafeAreaInsets();
  if (visualViewport) {
    return {
      width: visualViewport.width,
      height: visualViewport.height,
      offsetLeft: visualViewport.offsetLeft,
      offsetTop: visualViewport.offsetTop,
      ...safeArea
    };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    offsetLeft: 0,
    offsetTop: 0,
    ...safeArea
  };
}

/** True when the visible viewport is below the mobile bottom-sheet breakpoint. */
export function isNarrowLayout(viewport: LayoutViewport): boolean {
  return viewport.width < NARROW_VIEWPORT_WIDTH;
}

/**
 * Picks card layout: bottom-sheet on narrow viewports, else anchored when a
 * spotlight exists, otherwise centered.
 */
export function resolveTourCardLayoutMode(
  hasAnchor: boolean,
  viewport: LayoutViewport = readLayoutViewport()
): TourCardLayoutMode {
  if (isNarrowLayout(viewport)) {
    return 'bottom-sheet';
  }
  return hasAnchor ? 'anchored' : 'centered';
}

/** Positions the tour card next to the anchor, keeping it fully inside the visible viewport. */
export function computeCardPosition(
  anchorRect: AnchorRect,
  placement: TourPlacement,
  cardHeight: number,
  viewport: LayoutViewport = readLayoutViewport(),
  obstacleSelector?: string
): CardPosition {
  const visible = intersectViewport(anchorRect, viewport);
  const bounds = visibleBounds(viewport, cardHeight, CARD_WIDTH);
  const left = computeCardLeft(visible, placement, bounds);
  const top = computeCardTop(visible, placement, cardHeight, bounds, obstacleSelector);

  return { left, top };
}

/** Centers the tour card in the visible viewport. */
export function computeCenteredCardPosition(
  cardHeight: number,
  viewport: LayoutViewport = readLayoutViewport()
): CardPosition {
  const bounds = visibleBounds(viewport, cardHeight, CARD_WIDTH);
  const left = clamp((bounds.minLeft + bounds.maxLeft) / 2, bounds.minLeft, bounds.maxLeft);
  const top = clamp((bounds.minTop + bounds.maxTop) / 2, bounds.minTop, bounds.maxTop);
  return { left, top };
}

/** Pins the tour card to the bottom of the visible viewport (mobile bottom sheet). */
export function computeBottomSheetPosition(
  cardHeight: number,
  viewport: LayoutViewport = readLayoutViewport()
): CardPosition {
  const cardWidth = Math.min(CARD_WIDTH, viewport.width - 2 * CARD_MARGIN);
  const bounds = visibleBounds(viewport, cardHeight, cardWidth);
  const left = viewport.offsetLeft + (viewport.width - cardWidth) / 2;
  const top = bounds.maxTop;
  return {
    left: clamp(left, bounds.minLeft, bounds.maxLeft),
    top,
    width: cardWidth
  };
}

function defaultLayoutViewport(width: number, height: number): LayoutViewport {
  return {
    width,
    height,
    offsetLeft: 0,
    offsetTop: 0,
    safeAreaTop: 0,
    safeAreaRight: 0,
    safeAreaBottom: 0,
    safeAreaLeft: 0
  };
}

function readSafeAreaInsets(): Pick<
  LayoutViewport,
  'safeAreaTop' | 'safeAreaRight' | 'safeAreaBottom' | 'safeAreaLeft'
> {
  if (typeof document === 'undefined') {
    return { safeAreaTop: 0, safeAreaRight: 0, safeAreaBottom: 0, safeAreaLeft: 0 };
  }
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:fixed;visibility:hidden;pointer-events:none;top:env(safe-area-inset-top);right:env(safe-area-inset-right);bottom:env(safe-area-inset-bottom);left:env(safe-area-inset-left);';
  document.documentElement.appendChild(probe);
  const style = getComputedStyle(probe);
  const insets = {
    safeAreaTop: parseFloat(style.top) || 0,
    safeAreaRight: parseFloat(style.right) || 0,
    safeAreaBottom: parseFloat(style.bottom) || 0,
    safeAreaLeft: parseFloat(style.left) || 0
  };
  document.documentElement.removeChild(probe);
  return insets;
}

interface VisibleBounds {
  minLeft: number;
  maxLeft: number;
  minTop: number;
  maxTop: number;
}

function visibleBounds(viewport: LayoutViewport, cardHeight: number, cardWidth: number): VisibleBounds {
  const minLeft = viewport.offsetLeft + CARD_MARGIN + viewport.safeAreaLeft;
  const maxLeft = Math.max(
    minLeft,
    viewport.offsetLeft + viewport.width - cardWidth - CARD_MARGIN - viewport.safeAreaRight
  );
  const minTop = viewport.offsetTop + CARD_MARGIN + viewport.safeAreaTop;
  const maxTop = Math.max(
    minTop,
    viewport.offsetTop + viewport.height - cardHeight - CARD_MARGIN - viewport.safeAreaBottom
  );
  return { minLeft, maxLeft, minTop, maxTop };
}

function intersectViewport(rect: AnchorRect, viewport: LayoutViewport): AnchorRect {
  const viewportLeft = viewport.offsetLeft;
  const viewportTop = viewport.offsetTop;
  const viewportRight = viewport.offsetLeft + viewport.width;
  const viewportBottom = viewport.offsetTop + viewport.height;
  const left = Math.max(rect.left, viewportLeft);
  const top = Math.max(rect.top, viewportTop);
  const right = Math.min(rect.right, viewportRight);
  const bottom = Math.min(rect.bottom, viewportBottom);
  const width = Math.max(0, right - left);
  const height = Math.max(0, bottom - top);
  return { left, top, right, bottom, width, height };
}

function computeCardLeft(visible: AnchorRect, placement: TourPlacement, bounds: VisibleBounds): number {
  if (placement === 'left' || placement === 'right') {
    const besideLeft = visible.left - CARD_OFFSET - CARD_WIDTH;
    const besideRight = visible.right + CARD_OFFSET;
    const order = placement === 'left' ? [besideLeft, besideRight] : [besideRight, besideLeft];

    for (const left of order) {
      if (left >= bounds.minLeft && left <= bounds.maxLeft) {
        return left;
      }
    }
  }

  const centered = visible.left + visible.width / 2 - CARD_WIDTH / 2;
  return clamp(centered, bounds.minLeft, bounds.maxLeft);
}

function computeCardTop(
  visible: AnchorRect,
  placement: TourPlacement,
  cardHeight: number,
  bounds: VisibleBounds,
  obstacleSelector?: string
): number {
  const candidates = buildTopCandidates(visible, placement, cardHeight, obstacleSelector);

  for (const top of candidates) {
    if (top >= bounds.minTop && top <= bounds.maxTop) {
      return top;
    }
  }

  return clamp((bounds.minTop + bounds.maxTop) / 2, bounds.minTop, bounds.maxTop);
}

function buildTopCandidates(
  visible: AnchorRect,
  placement: TourPlacement,
  cardHeight: number,
  obstacleSelector?: string
): number[] {
  const above = visible.top - CARD_OFFSET - cardHeight;
  const below = Math.max(
    visible.bottom + CARD_OFFSET,
    toolbarAdjustedTop(visible, cardHeight, obstacleSelector) ?? -Infinity
  );

  const order: TourPlacement[] =
    placement === 'left' || placement === 'right'
      ? [placement, 'bottom', 'top']
      : placement === 'top'
        ? ['top', 'bottom']
        : ['bottom', 'top'];

  const tops: number[] = [];
  for (const side of order) {
    if (side === 'top') {
      tops.push(above);
    } else if (side === 'bottom') {
      tops.push(below);
    } else if (side === 'left' || side === 'right') {
      tops.push(visible.top, visible.top + visible.height / 2 - cardHeight / 2, visible.bottom - cardHeight);
    }
  }
  return tops;
}

function toolbarAdjustedTop(visible: AnchorRect, cardHeight: number, obstacleSelector?: string): number | null {
  if (typeof document === 'undefined' || !obstacleSelector) {
    return null;
  }
  const obstacleBottom = findNearbyObstacleBottom(visible, cardHeight, obstacleSelector);
  return obstacleBottom === null ? null : obstacleBottom + CARD_OFFSET;
}

function findNearbyObstacleBottom(anchorRect: AnchorRect, cardHeight: number, obstacleSelector: string): number | null {
  let nearestBottom: number | null = null;
  for (const obstacle of document.querySelectorAll<HTMLElement>(obstacleSelector)) {
    const obstacleRect = obstacle.getBoundingClientRect();
    if (obstacleRect.width === 0 && obstacleRect.height === 0) {
      continue;
    }
    const horizontalOverlap = anchorRect.left < obstacleRect.right && anchorRect.right > obstacleRect.left;
    const verticalProximity = obstacleRect.top < anchorRect.bottom + cardHeight;
    if (!horizontalOverlap || !verticalProximity) {
      continue;
    }
    nearestBottom = nearestBottom === null ? obstacleRect.bottom : Math.max(nearestBottom, obstacleRect.bottom);
  }
  return nearestBottom;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
