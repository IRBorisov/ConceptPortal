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

/** Indicates whether the tour should be offered on first visit. */
export function shouldOfferTour(progress: TourProgress | undefined, tourVersion: number): boolean {
  if (!progress) {
    return true;
  }
  return progress.status === 'pending' || progress.seenVersion < tourVersion;
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

  /** Tours dismissed via Escape in this session; prevents immediate auto-restart. Not persisted. */
  sessionDismissed: Record<string, boolean>;

  startTour: (tourID: string, fromStep?: number) => void;
  setActiveStep: (index: number) => void;

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
            activeStep: frame.returnStep
          });
          return;
        }
        set({
          activeTourID: null,
          activeStep: 0,
          tourStack: [],
          tours: nextTours
        });
      }

      return {
        tours: {},
        activeTourID: null,
        activeStep: 0,
        tourStack: [],
        sessionDismissed: {},

        startTour: (tourID, fromStep = 0) =>
          set({
            activeTourID: tourID,
            activeStep: Math.max(0, fromStep),
            tourStack: []
          }),

        setActiveStep: index => set({ activeStep: Math.max(0, index) }),

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
            tours: nextTours
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
            sessionDismissed: { ...state.sessionDismissed, [tourID]: false }
          }))
      };
    },
    {
      version: 1,
      partialize: state => ({ tours: state.tours }),
      name: 'portal.onboarding'
    }
  )
);
