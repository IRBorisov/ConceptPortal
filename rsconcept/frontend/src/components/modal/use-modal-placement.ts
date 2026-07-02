'use client';

import { useEffect, useState } from 'react';

const DEFAULT_TOP_OFFSET_RATIO = 0.16;
const DEFAULT_TOP_OFFSET_LIMIT = 160;
const DEFAULT_BOTTOM_MARGIN = 16;

function parseCssNumber(value: string, fallback: number) {
  const parsed = Number.parseFloat(value.trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseCssLengthToPx(value: string, fallback: number) {
  const normalized = value.trim();
  if (!normalized) {
    return fallback;
  }

  if (normalized.endsWith('px')) {
    return parseCssNumber(normalized, fallback);
  }

  if (normalized.endsWith('rem')) {
    const rem = parseCssNumber(normalized, Number.NaN);
    if (!Number.isFinite(rem)) {
      return fallback;
    }
    const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    return Number.isFinite(rootFontSize) ? rem * rootFontSize : fallback;
  }

  return fallback;
}

/**
 * Tracks whether a modal fits on screen and should use top-aligned placement.
 *
 * @param isEnabled - When false, always reports bottom-centered placement.
 * @returns `isTopPlaced` flag and `setElement` ref callback for the modal panel.
 */
export function useModalPlacement<TElement extends HTMLElement>(isEnabled = true) {
  const [element, setElement] = useState<TElement | null>(null);
  const [isTopPlaced, setIsTopPlaced] = useState(false);

  useEffect(
    function updateModalPlacement() {
      let animationFrameID: number | null = null;

      function setPlacement(nextValue: boolean) {
        animationFrameID = window.requestAnimationFrame(function applyModalPlacement() {
          setIsTopPlaced(nextValue);
        });
      }

      if (!isEnabled || !element) {
        setPlacement(false);
        return () => {
          if (animationFrameID !== null) {
            window.cancelAnimationFrame(animationFrameID);
          }
        };
      }
      const target = element;

      function updatePlacement() {
        if (animationFrameID !== null) {
          window.cancelAnimationFrame(animationFrameID);
        }

        const wrapperElement = target.parentElement;
        const wrapperStyles = wrapperElement ? window.getComputedStyle(wrapperElement) : null;
        const topOffsetRatio = parseCssNumber(
          wrapperStyles?.getPropertyValue('--cc-modal-top-offset-ratio') ?? '',
          DEFAULT_TOP_OFFSET_RATIO
        );
        const topOffsetLimit = parseCssLengthToPx(
          wrapperStyles?.getPropertyValue('--cc-modal-top-offset-limit') ?? '',
          DEFAULT_TOP_OFFSET_LIMIT
        );
        const bottomMargin = parseCssLengthToPx(
          wrapperStyles?.getPropertyValue('--cc-modal-bottom-margin') ?? '',
          DEFAULT_BOTTOM_MARGIN
        );

        const height = target.getBoundingClientRect().height;
        const topOffset = Math.min(window.innerHeight * topOffsetRatio, topOffsetLimit);
        setPlacement(height + topOffset + bottomMargin <= window.innerHeight);
      }

      const resizeObserver = new ResizeObserver(updatePlacement);
      resizeObserver.observe(target);
      window.addEventListener('resize', updatePlacement);
      updatePlacement();

      return () => {
        if (animationFrameID !== null) {
          window.cancelAnimationFrame(animationFrameID);
        }
        resizeObserver.disconnect();
        window.removeEventListener('resize', updatePlacement);
      };
    },
    [element, isEnabled]
  );

  return { isTopPlaced, setElement };
}
