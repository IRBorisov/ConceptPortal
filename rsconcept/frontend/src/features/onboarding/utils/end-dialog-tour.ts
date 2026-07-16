import { useOnboardingStore } from '../stores/onboarding';

/**
 * Ends the active tour when its host dialog closes (Escape, backdrop, submit, X).
 * Dialog tours are BadgeHelp-only and must not keep the page inert after the modal is gone.
 */
export function endDialogTourIfActive(tourID: string | undefined): void {
  if (!tourID) {
    return;
  }
  const { activeTourID, dismissActiveTour } = useOnboardingStore.getState();
  if (activeTourID === tourID) {
    dismissActiveTour();
  }
}
