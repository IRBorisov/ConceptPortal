import { type TourPlacement } from '../models/tour';

export const CARD_OFFSET = 12;
export const CARD_WIDTH = 400;
export const CARD_MARGIN = 8;
export const ESTIMATED_CARD_HEIGHT = 300;

export interface AnchorRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface ViewportSize {
  width: number;
  height: number;
}

export interface CardPosition {
  left: number;
  top: number;
}

/** Positions the tour card next to the anchor, keeping it fully inside the viewport. */
export function computeCardPosition(
  anchorRect: AnchorRect,
  placement: TourPlacement,
  cardHeight: number,
  viewport: ViewportSize = { width: window.innerWidth, height: window.innerHeight },
  obstacleSelector?: string
): CardPosition {
  const visible = intersectViewport(anchorRect, viewport);
  const left = computeCardLeft(visible, placement, viewport.width);
  const top = computeCardTop(visible, placement, cardHeight, viewport.height, obstacleSelector);

  return { left, top };
}

/** Centers the tour card in the viewport. */
export function computeCenteredCardPosition(
  cardHeight: number,
  viewport: ViewportSize = { width: window.innerWidth, height: window.innerHeight }
): CardPosition {
  const left = clamp(
    (viewport.width - CARD_WIDTH) / 2,
    CARD_MARGIN,
    Math.max(viewport.width - CARD_WIDTH - CARD_MARGIN, CARD_MARGIN)
  );
  const top = clamp(
    (viewport.height - cardHeight) / 2,
    CARD_MARGIN,
    Math.max(viewport.height - cardHeight - CARD_MARGIN, CARD_MARGIN)
  );
  return { left, top };
}

function intersectViewport(rect: AnchorRect, viewport: ViewportSize): AnchorRect {
  const left = Math.max(rect.left, 0);
  const top = Math.max(rect.top, 0);
  const right = Math.min(rect.right, viewport.width);
  const bottom = Math.min(rect.bottom, viewport.height);
  const width = Math.max(0, right - left);
  const height = Math.max(0, bottom - top);
  return { left, top, right, bottom, width, height };
}

function computeCardLeft(visible: AnchorRect, placement: TourPlacement, viewportWidth: number): number {
  const maxLeft = Math.max(viewportWidth - CARD_WIDTH - CARD_MARGIN, CARD_MARGIN);

  if (placement === 'left' || placement === 'right') {
    const besideLeft = visible.left - CARD_OFFSET - CARD_WIDTH;
    const besideRight = visible.right + CARD_OFFSET;
    const order = placement === 'left' ? [besideLeft, besideRight] : [besideRight, besideLeft];

    for (const left of order) {
      if (left >= CARD_MARGIN && left <= maxLeft) {
        return left;
      }
    }
  }

  const centered = visible.left + visible.width / 2 - CARD_WIDTH / 2;
  return clamp(centered, CARD_MARGIN, maxLeft);
}

function computeCardTop(
  visible: AnchorRect,
  placement: TourPlacement,
  cardHeight: number,
  viewportHeight: number,
  obstacleSelector?: string
): number {
  const maxTop = Math.max(viewportHeight - cardHeight - CARD_MARGIN, CARD_MARGIN);
  const candidates = buildTopCandidates(visible, placement, cardHeight, obstacleSelector);

  for (const top of candidates) {
    if (top >= CARD_MARGIN && top <= maxTop) {
      return top;
    }
  }

  return clamp((viewportHeight - cardHeight) / 2, CARD_MARGIN, maxTop);
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
