'use client';

import { useEffect, useState } from 'react';

/** Tailwind breakpoints (`--breakpoint-*` in `src/index.css`). */
export const BREAKPOINT = {
  'xs': 475,
  'sm': 640,
  'md': 768,
  'lg': 1024,
  'xl': 1280,
  '2xl': 1536
} as const;

export interface WindowSizeState {
  width: number | undefined;
  height: number | undefined;
  /** Viewport is below the `sm` breakpoint. */
  isSmall: boolean;
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  is2xl: boolean;
}

/** Derives viewport dimensions and Tailwind min-width breakpoint flags. */
export function getWindowSizeState(width: number | undefined, height: number | undefined): WindowSizeState {
  const knownWidth = width !== undefined;

  return {
    width,
    height,
    isSmall: knownWidth && width < BREAKPOINT.sm,
    isXs: knownWidth && width >= BREAKPOINT.xs,
    isSm: knownWidth && width >= BREAKPOINT.sm,
    isMd: knownWidth && width >= BREAKPOINT.md,
    isLg: knownWidth && width >= BREAKPOINT.lg,
    isXl: knownWidth && width >= BREAKPOINT.xl,
    is2xl: knownWidth && width >= BREAKPOINT['2xl']
  };
}

function readWindowSizeState(): WindowSizeState {
  if (typeof window !== 'object') {
    return getWindowSizeState(undefined, undefined);
  }
  return getWindowSizeState(window.innerWidth, window.innerHeight);
}

/**
 * Tracks viewport width and height, plus Tailwind breakpoint flags.
 *
 * @returns `{ width, height, isSmall, isXs, isSm, isMd, isLg, isXl, is2xl }` — dimensions are `undefined` during SSR.
 */
export function useWindowSize(): WindowSizeState {
  const [windowSize, setWindowSize] = useState(readWindowSizeState);

  useEffect(function listenForWindowSizeChanges() {
    if (typeof window !== 'object') {
      return;
    }
    function handleResize() {
      setWindowSize(getWindowSizeState(window.innerWidth, window.innerHeight));
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}
