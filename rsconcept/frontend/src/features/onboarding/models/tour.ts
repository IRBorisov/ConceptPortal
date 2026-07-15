import { type ReactNode } from 'react';

/** DOM attribute marking tour step targets. */
export const TOUR_ANCHOR_ATTR = 'data-tour';

/** Localized content of a single tour step. */
export interface TourStepContent {
  title: string;
  body: ReactNode;
}

/** Per-locale step content keyed by step id. */
export interface TourLocaleContent {
  en: Record<string, TourStepContent>;
  ru: Record<string, TourStepContent>;
  fr: Record<string, TourStepContent>;
}

/** Navigation facade passed to step hooks; kept minimal so tours stay decoupled from router internals. */
export interface TourStepController {
  /** Current location pathname when the step activates. */
  pathname: string;
  changeTab: (tabID: number) => void;
  gotoEditActive: (activeID: number) => void;
}

/** Popover side relative to the anchored element. */
export type TourPlacement = 'top' | 'bottom' | 'left' | 'right';

/**
 * Step presentation mode.
 * - `explain` (default): full-app inert modal; user advances via the card.
 * - `interact`: unlocks a declared region for practice; optional action auto-advances.
 */
export type TourStepMode = 'explain' | 'interact';

export interface TourStep {
  id: string;

  /** `data-tour` value of the target element; steps without an anchor render as centered modal steps. */
  anchor?: string;

  /** Preferred popover side; the host may flip it when there is not enough space. */
  placement?: TourPlacement;

  /** Defaults to `explain`. */
  mode?: TourStepMode;

  /**
   * `data-tour` value of the operable region when `mode` is `interact`.
   * Defaults to `anchor` when omitted.
   */
  interactionRegion?: string;

  /**
   * Stable action id (see `emitOnboardingAction`) that completes this step once when `mode` is `interact`.
   * Next remains available as a manual fallback.
   */
  completeAction?: string;

  /**
   * Optional nested tour id offered from this step ("Explore").
   * The subtour is a separate registered `Tour` and can also be started on its own.
   */
  subtour?: string;

  /** Invoked when the step becomes active, before anchor resolution (e.g. to switch tabs). */
  onEnter?: (controller: TourStepController) => void;
}

/** Resolved step mode; `explain` when omitted in tour data. */
export function resolveTourStepMode(step: Pick<TourStep, 'mode'>): TourStepMode {
  return step.mode ?? 'explain';
}

/** `data-tour` anchor for the interactable region; only meaningful when mode is `interact`. */
export function resolveInteractionRegionAnchor(step: Pick<TourStep, 'anchor' | 'interactionRegion'>): string | undefined {
  return step.interactionRegion ?? step.anchor;
}

export interface Tour {
  id: string;

  /**
   * Bump to re-offer the tour to users who completed an older version.
   * Explicitly skipped tours stay opted out of automatic offers across bumps.
   */
  version: number;

  /**
   * Pathname(s) where the tour may run.
   * An entry matches exactly, or as a prefix when followed by `/` (e.g. `/rsforms` → `/rsforms/12`).
   */
  route: string | readonly string[];

  /** Whether the tour is offered automatically on first visit to a matching route. */
  autoStart: boolean;

  steps: TourStep[];
  content: TourLocaleContent;
}

/** True when `pathname` is allowed for this tour (exact or prefix match). */
export function tourMatchesRoute(tour: Pick<Tour, 'route'>, pathname: string): boolean {
  const routes = typeof tour.route === 'string' ? [tour.route] : tour.route;
  return routes.some(route => pathname === route || pathname.startsWith(`${route}/`));
}

/** Frame saved when diving into a subtour so the parent can resume afterward. */
export interface TourStackFrame {
  tourID: string;
  returnStep: number;
}

/** Validates tour invariants; returns a list of problems (empty when valid). */
export function validateTour(tour: Tour): string[] {
  const problems: string[] = [];
  if (tour.steps.length === 0) {
    problems.push(`tour "${tour.id}" has no steps`);
  }
  if (tour.version < 1) {
    problems.push(`tour "${tour.id}" version must be >= 1`);
  }
  const seen = new Set<string>();
  for (const step of tour.steps) {
    if (seen.has(step.id)) {
      problems.push(`tour "${tour.id}" has duplicate step id "${step.id}"`);
    }
    seen.add(step.id);
    if (step.subtour?.trim() === '') {
      problems.push(`tour "${tour.id}" step "${step.id}" has an empty subtour id`);
    }
    if (step.subtour === tour.id) {
      problems.push(`tour "${tour.id}" step "${step.id}" cannot reference itself as a subtour`);
    }
    const mode = resolveTourStepMode(step);
    if (mode === 'explain') {
      if (step.interactionRegion !== undefined) {
        problems.push(`tour "${tour.id}" step "${step.id}" sets interactionRegion but mode is not "interact"`);
      }
      if (step.completeAction !== undefined) {
        problems.push(`tour "${tour.id}" step "${step.id}" sets completeAction but mode is not "interact"`);
      }
    } else {
      const regionAnchor = resolveInteractionRegionAnchor(step)?.trim();
      if (!regionAnchor) {
        problems.push(`tour "${tour.id}" step "${step.id}" interact mode requires anchor or interactionRegion`);
      }
      if (step.interactionRegion?.trim() === '') {
        problems.push(`tour "${tour.id}" step "${step.id}" has an empty interactionRegion`);
      }
      if (step.completeAction?.trim() === '') {
        problems.push(`tour "${tour.id}" step "${step.id}" has an empty completeAction`);
      }
    }
  }
  for (const locale of ['en', 'ru', 'fr'] as const) {
    for (const step of tour.steps) {
      if (!tour.content[locale][step.id]) {
        problems.push(`tour "${tour.id}" step "${step.id}" is missing "${locale}" content`);
      }
    }
  }
  return problems;
}

/** Collects `subtour` ids referenced by steps; used by the registry to verify links resolve. */
export function collectSubtourIDs(tour: Tour): string[] {
  const ids: string[] = [];
  for (const step of tour.steps) {
    if (step.subtour) {
      ids.push(step.subtour);
    }
  }
  return ids;
}
