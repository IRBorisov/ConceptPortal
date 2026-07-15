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
const SUBTOUR_ID = 'constituents-list';
const TOUR_VERSION = 2;

function resetStore() {
  useOnboardingStore.setState({
    tours: {},
    activeTourID: null,
    activeStep: 0,
    tourStack: [],
    sessionDismissed: {},
    resumeOfferTourID: null
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

  test('does not offer done when seenVersion meets tour version', () => {
    const done: TourProgress = { status: 'done', seenVersion: TOUR_VERSION, resumeStep: 0 };
    expect(shouldOfferTour(done, TOUR_VERSION)).toBe(false);
  });

  test('never auto-offers skipped tours, even after a version bump', () => {
    const skippedCurrent: TourProgress = { status: 'skipped', seenVersion: TOUR_VERSION, resumeStep: 0 };
    const skippedOlder: TourProgress = { status: 'skipped', seenVersion: 1, resumeStep: 0 };

    expect(shouldOfferTour(skippedCurrent, TOUR_VERSION)).toBe(false);
    expect(shouldOfferTour(skippedOlder, TOUR_VERSION)).toBe(false);
  });

  test('re-offers completed tours after a version bump', () => {
    const done: TourProgress = { status: 'done', seenVersion: 1, resumeStep: 0 };
    expect(shouldOfferTour(done, TOUR_VERSION)).toBe(true);
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
    expect(useOnboardingStore.getState().tourStack).toEqual([]);

    useOnboardingStore.getState().startTour(TOUR_ID, -5);
    expect(useOnboardingStore.getState().activeStep).toBe(0);
  });

  test('declineTourOffer only sets sessionDismissed without changing progress', () => {
    useOnboardingStore.setState({
      tours: { [TOUR_ID]: { status: 'pending', seenVersion: 0, resumeStep: 2 } }
    });

    useOnboardingStore.getState().declineTourOffer(TOUR_ID);

    const state = useOnboardingStore.getState();
    expect(state.sessionDismissed[TOUR_ID]).toBe(true);
    expect(state.tours[TOUR_ID]).toEqual({ status: 'pending', seenVersion: 0, resumeStep: 2 });
    expect(state.activeTourID).toBeNull();
  });

  test('startTour clears a prior session dismissal for that tour', () => {
    useOnboardingStore.setState({ sessionDismissed: { [TOUR_ID]: true } });
    useOnboardingStore.getState().startTour(TOUR_ID, 1);

    expect(useOnboardingStore.getState().sessionDismissed[TOUR_ID]).toBe(false);
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
    expect(state.sessionDismissed[TOUR_ID]).not.toBe(true);
    expect(state.resumeOfferTourID).toBe(TOUR_ID);
  });

  test('startTour and declineTourOffer clear a pending resume offer', () => {
    useOnboardingStore.getState().startTour(TOUR_ID, 2);
    useOnboardingStore.getState().pauseActiveTour();
    expect(useOnboardingStore.getState().resumeOfferTourID).toBe(TOUR_ID);

    useOnboardingStore.getState().declineTourOffer(TOUR_ID);
    expect(useOnboardingStore.getState().resumeOfferTourID).toBeNull();

    useOnboardingStore.getState().startTour(TOUR_ID, 2);
    useOnboardingStore.getState().pauseActiveTour();
    useOnboardingStore.getState().startTour(TOUR_ID, 2);
    expect(useOnboardingStore.getState().resumeOfferTourID).toBeNull();
  });

  test('dismissActiveTour is a no-op without an active tour', () => {
    useOnboardingStore.getState().dismissActiveTour();

    expect(useOnboardingStore.getState()).toMatchObject({
      activeTourID: null,
      activeStep: 0,
      tours: {},
      sessionDismissed: {},
      tourStack: []
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
      sessionDismissed: { [TOUR_ID]: true },
      tourStack: [{ tourID: 'parent', returnStep: 1 }]
    });

    useOnboardingStore.getState().restartTour(TOUR_ID);

    const state = useOnboardingStore.getState();
    expect(state.activeTourID).toBe(TOUR_ID);
    expect(state.activeStep).toBe(0);
    expect(state.tourStack).toEqual([]);
    expect(state.tours[TOUR_ID]).toEqual(defaultTourProgress);
    expect(state.sessionDismissed[TOUR_ID]).toBe(false);
  });

  test('enterSubtour pushes parent frame and starts the nested tour at step 0', () => {
    useOnboardingStore.getState().startTour(TOUR_ID, 2);
    useOnboardingStore.getState().enterSubtour(SUBTOUR_ID);

    const state = useOnboardingStore.getState();
    expect(state.activeTourID).toBe(SUBTOUR_ID);
    expect(state.activeStep).toBe(0);
    expect(state.tourStack).toEqual([{ tourID: TOUR_ID, returnStep: 2 }]);
    expect(state.tours[TOUR_ID]).toEqual({ ...defaultTourProgress, resumeStep: 2 });
  });

  test('completeActiveTour on a subtour returns to the parent step', () => {
    useOnboardingStore.getState().startTour(TOUR_ID, 2);
    useOnboardingStore.getState().enterSubtour(SUBTOUR_ID);
    useOnboardingStore.getState().completeActiveTour(1);

    const state = useOnboardingStore.getState();
    expect(state.activeTourID).toBe(TOUR_ID);
    expect(state.activeStep).toBe(2);
    expect(state.tourStack).toEqual([]);
    expect(state.tours[SUBTOUR_ID]).toEqual({ status: 'done', seenVersion: 1, resumeStep: 0 });
  });

  test('dismissActiveTour on a subtour returns to the parent and session-dismisses the subtour', () => {
    useOnboardingStore.getState().startTour(TOUR_ID, 2);
    useOnboardingStore.getState().enterSubtour(SUBTOUR_ID);
    useOnboardingStore.getState().setActiveStep(1);
    useOnboardingStore.getState().dismissActiveTour();

    const state = useOnboardingStore.getState();
    expect(state.activeTourID).toBe(TOUR_ID);
    expect(state.activeStep).toBe(2);
    expect(state.tourStack).toEqual([]);
    expect(state.tours[SUBTOUR_ID]).toEqual({ ...defaultTourProgress, resumeStep: 1 });
    expect(state.sessionDismissed[SUBTOUR_ID]).toBe(true);
  });

  test('returnFromSubtour restores the parent without marking the subtour done', () => {
    useOnboardingStore.getState().startTour(TOUR_ID, 2);
    useOnboardingStore.getState().enterSubtour(SUBTOUR_ID);
    expect(useOnboardingStore.getState().returnFromSubtour()).toBe(true);

    const state = useOnboardingStore.getState();
    expect(state.activeTourID).toBe(TOUR_ID);
    expect(state.activeStep).toBe(2);
    expect(state.tourStack).toEqual([]);
    expect(state.tours[SUBTOUR_ID]).toBeUndefined();
  });

  test('pauseActiveTour while nested persists parent and child resume points', () => {
    useOnboardingStore.getState().startTour(TOUR_ID, 2);
    useOnboardingStore.getState().enterSubtour(SUBTOUR_ID);
    useOnboardingStore.getState().setActiveStep(1);
    useOnboardingStore.getState().pauseActiveTour();

    const state = useOnboardingStore.getState();
    expect(state.activeTourID).toBeNull();
    expect(state.tourStack).toEqual([]);
    expect(state.tours[TOUR_ID]).toEqual({ ...defaultTourProgress, resumeStep: 2 });
    expect(state.tours[SUBTOUR_ID]).toEqual({ ...defaultTourProgress, resumeStep: 1 });
    expect(state.resumeOfferTourID).toBe(SUBTOUR_ID);
  });
});
