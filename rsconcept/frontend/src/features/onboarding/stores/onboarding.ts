import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

  /** Tours dismissed via Escape in this session; prevents immediate auto-restart. Not persisted. */
  sessionDismissed: Record<string, boolean>;

  startTour: (tourID: string, fromStep?: number) => void;
  setActiveStep: (index: number) => void;

  /** Escape/dismiss: keeps status `pending`, saves the resume point, and suppresses auto-restart this session. */
  dismissActiveTour: () => void;

  /** Route leave: keeps status `pending` and saves the resume point without suppressing auto-restart. */
  pauseActiveTour: () => void;

  skipActiveTour: (tourVersion: number) => void;
  completeActiveTour: (tourVersion: number) => void;

  /** Manual re-entry: resets progress and starts the tour from the beginning. */
  restartTour: (tourID: string) => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      tours: {},
      activeTourID: null,
      activeStep: 0,
      sessionDismissed: {},

      startTour: (tourID, fromStep = 0) =>
        set({
          activeTourID: tourID,
          activeStep: Math.max(0, fromStep)
        }),

      setActiveStep: index => set({ activeStep: Math.max(0, index) }),

      dismissActiveTour: () => {
        const { activeTourID, activeStep, tours, sessionDismissed } = get();
        if (!activeTourID) {
          return;
        }
        const progress = tours[activeTourID] ?? defaultTourProgress;
        set({
          activeTourID: null,
          tours: {
            ...tours,
            [activeTourID]: { ...progress, status: 'pending', resumeStep: activeStep }
          },
          sessionDismissed: { ...sessionDismissed, [activeTourID]: true }
        });
      },

      pauseActiveTour: () => {
        const { activeTourID, activeStep, tours } = get();
        if (!activeTourID) {
          return;
        }
        const progress = tours[activeTourID] ?? defaultTourProgress;
        set({
          activeTourID: null,
          tours: {
            ...tours,
            [activeTourID]: { ...progress, status: 'pending', resumeStep: activeStep }
          }
        });
      },

      skipActiveTour: tourVersion => {
        const { activeTourID, tours } = get();
        if (!activeTourID) {
          return;
        }
        set({
          activeTourID: null,
          tours: {
            ...tours,
            [activeTourID]: { status: 'skipped', seenVersion: tourVersion, resumeStep: 0 }
          }
        });
      },

      completeActiveTour: tourVersion => {
        const { activeTourID, tours } = get();
        if (!activeTourID) {
          return;
        }
        set({
          activeTourID: null,
          tours: {
            ...tours,
            [activeTourID]: { status: 'done', seenVersion: tourVersion, resumeStep: 0 }
          }
        });
      },

      restartTour: tourID =>
        set(state => ({
          activeTourID: tourID,
          activeStep: 0,
          tours: {
            ...state.tours,
            [tourID]: { ...defaultTourProgress }
          },
          sessionDismissed: { ...state.sessionDismissed, [tourID]: false }
        }))
    }),
    {
      version: 1,
      partialize: state => ({ tours: state.tours }),
      name: 'portal.onboarding'
    }
  )
);
