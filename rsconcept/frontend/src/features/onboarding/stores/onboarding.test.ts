import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const storage = vi.hoisted(() => {
  let data: Record<string, string> = {};
  return {
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
    removeItem: (key: string) => {
      delete data[key];
    },
    clear: () => {
      data = {};
    },
    key: (index: number) => Object.keys(data)[index] ?? null,
    get length() {
      return Object.keys(data).length;
    }
  };
});

vi.stubGlobal('localStorage', storage);

import { defaultTourProgress, shouldOfferTour, type TourProgress, useOnboardingStore } from './onboarding';

const TOUR_ID = 'sandbox-intro';
const TOUR_VERSION = 2;

function resetStore() {
  useOnboardingStore.setState({
    tours: {},
    activeTourID: null,
    activeStep: 0,
    sessionDismissed: {}
  });
  storage.clear();
}

describe('shouldOfferTour', () => {
  test('offers when progress is undefined', () => {
    expect(shouldOfferTour(undefined, TOUR_VERSION)).toBe(true);
  });

  test('offers when status is pending', () => {
    const progress: TourProgress = { status: 'pending', seenVersion: 0, resumeStep: 0 };
    expect(shouldOfferTour(progress, TOUR_VERSION)).toBe(true);
  });

  test('does not offer done/skipped when seenVersion meets tour version', () => {
    const done: TourProgress = { status: 'done', seenVersion: TOUR_VERSION, resumeStep: 0 };
    const skipped: TourProgress = { status: 'skipped', seenVersion: TOUR_VERSION, resumeStep: 0 };

    expect(shouldOfferTour(done, TOUR_VERSION)).toBe(false);
    expect(shouldOfferTour(skipped, TOUR_VERSION)).toBe(false);
  });

  test('re-offers done/skipped after a version bump', () => {
    const done: TourProgress = { status: 'done', seenVersion: 1, resumeStep: 0 };
    const skipped: TourProgress = { status: 'skipped', seenVersion: 1, resumeStep: 0 };

    expect(shouldOfferTour(done, TOUR_VERSION)).toBe(true);
    expect(shouldOfferTour(skipped, TOUR_VERSION)).toBe(true);
  });
});

describe('useOnboardingStore', () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.stubGlobal('localStorage', storage);
  });

  test('startTour sets active tour and step; negative fromStep clamps to 0', () => {
    useOnboardingStore.getState().startTour(TOUR_ID, 3);
    expect(useOnboardingStore.getState().activeTourID).toBe(TOUR_ID);
    expect(useOnboardingStore.getState().activeStep).toBe(3);

    useOnboardingStore.getState().startTour(TOUR_ID, -5);
    expect(useOnboardingStore.getState().activeStep).toBe(0);
  });

  test('dismissActiveTour saves resume point, keeps pending, and sets sessionDismissed', () => {
    useOnboardingStore.getState().startTour(TOUR_ID, 4);
    useOnboardingStore.getState().dismissActiveTour();

    const state = useOnboardingStore.getState();
    expect(state.activeTourID).toBeNull();
    expect(state.tours[TOUR_ID]).toEqual({ ...defaultTourProgress, resumeStep: 4 });
    expect(state.sessionDismissed[TOUR_ID]).toBe(true);
  });

  test('pauseActiveTour saves resume point and keeps pending without session dismissal', () => {
    useOnboardingStore.getState().startTour(TOUR_ID, 4);
    useOnboardingStore.getState().pauseActiveTour();

    const state = useOnboardingStore.getState();
    expect(state.activeTourID).toBeNull();
    expect(state.tours[TOUR_ID]).toEqual({ ...defaultTourProgress, resumeStep: 4 });
    expect(state.sessionDismissed[TOUR_ID]).toBeUndefined();
  });

  test('dismissActiveTour is a no-op without an active tour', () => {
    useOnboardingStore.getState().dismissActiveTour();

    expect(useOnboardingStore.getState()).toMatchObject({
      activeTourID: null,
      activeStep: 0,
      tours: {},
      sessionDismissed: {}
    });
  });

  test('skipActiveTour marks tour skipped and records seen version', () => {
    useOnboardingStore.getState().startTour(TOUR_ID, 2);
    useOnboardingStore.getState().skipActiveTour(TOUR_VERSION);

    const state = useOnboardingStore.getState();
    expect(state.activeTourID).toBeNull();
    expect(state.tours[TOUR_ID]).toEqual({
      status: 'skipped',
      seenVersion: TOUR_VERSION,
      resumeStep: 0
    });
  });

  test('completeActiveTour marks tour done and records seen version', () => {
    useOnboardingStore.getState().startTour(TOUR_ID, 2);
    useOnboardingStore.getState().completeActiveTour(TOUR_VERSION);

    const state = useOnboardingStore.getState();
    expect(state.activeTourID).toBeNull();
    expect(state.tours[TOUR_ID]).toEqual({
      status: 'done',
      seenVersion: TOUR_VERSION,
      resumeStep: 0
    });
  });

  test('restartTour resets progress, clears session dismissal, and activates the tour', () => {
    useOnboardingStore.setState({
      tours: {
        [TOUR_ID]: { status: 'done', seenVersion: 5, resumeStep: 3 }
      },
      sessionDismissed: { [TOUR_ID]: true }
    });

    useOnboardingStore.getState().restartTour(TOUR_ID);

    const state = useOnboardingStore.getState();
    expect(state.activeTourID).toBe(TOUR_ID);
    expect(state.activeStep).toBe(0);
    expect(state.tours[TOUR_ID]).toEqual(defaultTourProgress);
    expect(state.sessionDismissed[TOUR_ID]).toBe(false);
  });
});
