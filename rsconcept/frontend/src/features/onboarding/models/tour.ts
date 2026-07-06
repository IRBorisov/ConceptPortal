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
  changeTab: (tabID: number) => void;
}

/** Popover side relative to the anchored element. */
export type TourPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TourStep {
  id: string;

  /** `data-tour` value of the target element; steps without an anchor render as centered modal steps. */
  anchor?: string;

  /** Preferred popover side; the host may flip it when there is not enough space. */
  placement?: TourPlacement;

  /** Invoked when the step becomes active, before anchor resolution (e.g. to switch tabs). */
  onEnter?: (controller: TourStepController) => void;
}

export interface Tour {
  id: string;

  /** Bump to re-offer the tour to users who completed or skipped an older version. */
  version: number;

  /** Pathname hosting the tour; used for auto-start matching and dismissal on leave. */
  route: string;

  /** Whether the tour is offered automatically on first visit to `route`. */
  autoStart: boolean;

  steps: TourStep[];
  content: TourLocaleContent;
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
