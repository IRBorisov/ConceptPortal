import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { type TourStackFrame } from '../models/tour';

/** Persisted per-tour completion status. */
export type TourStatus = 'pending' | 'skipped' | 'done';

/** Persisted progress of a single tour. */
export interface TourProgress {
  status: TourStatus;

  /** Tour version at the moment of skip/completion; used to re-offer after version bumps. */
  seenVersion: number;

  /** Step index to resume from after dismissal. */
  resumeStep: number;
}

export const defaultTourProgress: TourProgress = {
  status: 'pending',
  seenVersion: 0,
  resumeStep: 0
};

/**
 * Indicates whether the tour should be auto-offered (invitation) on a matching route.
 * Explicit `skipped` stays opted out across version bumps; `done` may be re-offered after a bump.
 * Manual restart via BadgeHelp/menu is independent of this check.
 */
export function shouldOfferTour(progress: TourProgress | undefined, tourVersion: number): boolean {
  if (!progress) {
    return true;
  }
  if (progress.status === 'skipped') {
    return false;
  }
  if (progress.status === 'pending') {
    return true;
  }
  return progress.seenVersion < tourVersion;
}

interface OnboardingStore {
  /** Persisted progress keyed by tour id. */
  tours: Record<string, TourProgress>;

  /** Currently running tour; not persisted. */
  activeTourID: string | null;
  activeStep: number;

  /**
   * Parent frames when a subtour is open (innermost parent last).
   * Not persisted — nested context is session-only.
   */
  tourStack: TourStackFrame[];

  /**
   * Tours declined or Escape-dismissed in this session; suppresses auto-offer invitation.
   * Not persisted — "Not now" never marks the tour skipped.
   */
  sessionDismissed: Record<string, boolean>;

  /**
   * Innermost tour paused by leaving its route (e.g. help link → manuals).
   * Persisted so hard navigations / remounts still re-offer Resume when `autoStart` is false.
   */
  resumeOfferTourID: string | null;

  /**
   * Parent frames captured with {@link pauseActiveTour} while nested.
   * Restored by {@link startTour} when resuming the paused tour so Explore nesting survives route leave
   * and hard navigations (Playwright `goto`, refresh).
   */
  resumeNesting: TourStackFrame[];

  startTour: (tourID: string, fromStep?: number) => void;
  setActiveStep: (index: number) => void;

  /** Session-only decline of an auto-start invitation; does not change persisted progress. */
  declineTourOffer: (tourID: string) => void;

  /** Dive into a nested tour from the current step; parent resumes at that step when the subtour ends. */
  enterSubtour: (tourID: string) => void;

  /**
   * Pop the innermost parent and resume it.
   * @returns whether a parent was restored
   */
  returnFromSubtour: () => boolean;

  /** Escape/dismiss: keeps status `pending`, saves the resume point; nested Escape returns to the parent. */
  dismissActiveTour: () => void;

  /** Route leave: keeps status `pending` and saves the resume point without suppressing auto-restart. */
  pauseActiveTour: () => void;

  skipActiveTour: (tourVersion: number) => void;
  completeActiveTour: (tourVersion: number) => void;

  /** Manual re-entry: resets progress and starts the tour from the beginning (clears nested stack). */
  restartTour: (tourID: string) => void;
}

function withTourProgress(
  tours: Record<string, TourProgress>,
  tourID: string,
  patch: Partial<TourProgress>
): Record<string, TourProgress> {
  const progress = tours[tourID] ?? defaultTourProgress;
  return {
    ...tours,
    [tourID]: { ...progress, ...patch }
  };
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => {
      function finishTour(tourVersion: number, status: 'skipped' | 'done') {
        const { activeTourID, tours, tourStack } = get();
        if (!activeTourID) {
          return;
        }
        const nextTours = withTourProgress(tours, activeTourID, {
          status,
          seenVersion: tourVersion,
          resumeStep: 0
        });
        if (tourStack.length > 0) {
          const frame = tourStack[tourStack.length - 1];
          set({
            tours: nextTours,
            tourStack: tourStack.slice(0, -1),
            activeTourID: frame.tourID,
            activeStep: frame.returnStep,
            resumeOfferTourID: null
          });
          return;
        }
        set({
          activeTourID: null,
          activeStep: 0,
          tourStack: [],
          tours: nextTours,
          resumeOfferTourID: null
        });
      }

      return {
        tours: {},
        activeTourID: null,
        activeStep: 0,
        tourStack: [],
        sessionDismissed: {},
        resumeOfferTourID: null,
        resumeNesting: [],

        startTour: (tourID, fromStep = 0) => {
          const { resumeOfferTourID, resumeNesting, sessionDismissed } = get();
          const restoreStack = resumeOfferTourID === tourID ? resumeNesting : [];
          set({
            activeTourID: tourID,
            activeStep: Math.max(0, fromStep),
            tourStack: restoreStack,
            sessionDismissed: { ...sessionDismissed, [tourID]: false },
            resumeOfferTourID: null,
            resumeNesting: []
          });
        },

        setActiveStep: index => set({ activeStep: Math.max(0, index) }),

        declineTourOffer: tourID =>
          set(state => {
            const clearingResume = state.resumeOfferTourID === tourID;
            return {
              sessionDismissed: { ...state.sessionDismissed, [tourID]: true },
              resumeOfferTourID: clearingResume ? null : state.resumeOfferTourID,
              resumeNesting: clearingResume ? [] : state.resumeNesting
            };
          }),

        enterSubtour: tourID => {
          const { activeTourID, activeStep, tours, tourStack, sessionDismissed } = get();
          if (!activeTourID || tourID === activeTourID) {
            return;
          }
          set({
            tours: withTourProgress(tours, activeTourID, { status: 'pending', resumeStep: activeStep }),
            tourStack: [...tourStack, { tourID: activeTourID, returnStep: activeStep }],
            activeTourID: tourID,
            activeStep: 0,
            sessionDismissed: { ...sessionDismissed, [tourID]: false }
          });
        },

        returnFromSubtour: () => {
          const { tourStack } = get();
          if (tourStack.length === 0) {
            return false;
          }
          const frame = tourStack[tourStack.length - 1];
          set({
            tourStack: tourStack.slice(0, -1),
            activeTourID: frame.tourID,
            activeStep: frame.returnStep
          });
          return true;
        },

        dismissActiveTour: () => {
          const { activeTourID, activeStep, tours, sessionDismissed, tourStack } = get();
          if (!activeTourID) {
            return;
          }
          const nextTours = withTourProgress(tours, activeTourID, { status: 'pending', resumeStep: activeStep });
          if (tourStack.length > 0) {
            const frame = tourStack[tourStack.length - 1];
            set({
              tours: nextTours,
              sessionDismissed: { ...sessionDismissed, [activeTourID]: true },
              tourStack: tourStack.slice(0, -1),
              activeTourID: frame.tourID,
              activeStep: frame.returnStep
            });
            return;
          }
          set({
            activeTourID: null,
            activeStep: 0,
            tourStack: [],
            tours: nextTours,
            sessionDismissed: { ...sessionDismissed, [activeTourID]: true }
          });
        },

        pauseActiveTour: () => {
          const { activeTourID, activeStep, tours, tourStack } = get();
          if (!activeTourID) {
            return;
          }
          let nextTours = withTourProgress(tours, activeTourID, { status: 'pending', resumeStep: activeStep });
          // Persist each parent resume point so leaving mid-subtour does not lose the outer tour.
          for (const frame of tourStack) {
            nextTours = withTourProgress(nextTours, frame.tourID, {
              status: 'pending',
              resumeStep: frame.returnStep
            });
          }
          set({
            activeTourID: null,
            activeStep: 0,
            tourStack: [],
            tours: nextTours,
            resumeOfferTourID: activeTourID,
            // Keep parent frames so Resume can restore Explore nesting (not only the child tour).
            resumeNesting: tourStack
          });
        },

        skipActiveTour: tourVersion => {
          finishTour(tourVersion, 'skipped');
        },

        completeActiveTour: tourVersion => {
          finishTour(tourVersion, 'done');
        },

        restartTour: tourID =>
          set(state => ({
            activeTourID: tourID,
            activeStep: 0,
            tourStack: [],
            tours: {
              ...state.tours,
              [tourID]: { ...defaultTourProgress }
            },
            sessionDismissed: { ...state.sessionDismissed, [tourID]: false },
            resumeOfferTourID: null,
            resumeNesting: []
          }))
      };
    },
    {
      version: 1,
      partialize: state => ({
        tours: state.tours,
        // Keep paused resume target + Explore nesting across remounts (pagehide / hard nav).
        resumeOfferTourID: state.resumeOfferTourID,
        resumeNesting: state.resumeNesting
      }),
      name: 'portal.onboarding'
    }
  )
);
