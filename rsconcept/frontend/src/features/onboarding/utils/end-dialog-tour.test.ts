import { describe, expect, test } from 'vitest';

import { useOnboardingStore } from '../stores/onboarding';

import { endDialogTourIfActive } from './end-dialog-tour';

describe('endDialogTourIfActive', () => {
  test('dismisses the active tour when it matches the dialog tour id', () => {
    useOnboardingStore.setState({
      activeTourID: 'formula-tree',
      activeStep: 1,
      tourStack: [],
      sessionDismissed: {},
      resumeOfferTourID: null,
      resumeNesting: [],
      tours: {}
    });

    endDialogTourIfActive('formula-tree');

    const state = useOnboardingStore.getState();
    expect(state.activeTourID).toBeNull();
    expect(state.sessionDismissed['formula-tree']).toBe(true);
  });

  test('ignores other active tours and missing ids', () => {
    useOnboardingStore.setState({
      activeTourID: 'sandbox-intro',
      activeStep: 0,
      tourStack: [],
      sessionDismissed: {},
      resumeOfferTourID: null,
      resumeNesting: [],
      tours: {}
    });

    endDialogTourIfActive(undefined);
    endDialogTourIfActive('formula-tree');

    expect(useOnboardingStore.getState().activeTourID).toBe('sandbox-intro');
  });
});
