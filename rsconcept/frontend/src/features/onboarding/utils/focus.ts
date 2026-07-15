const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Returns whether the element can receive focus in the current document. */
export function isFocusableElement(element: HTMLElement): boolean {
  if (!canReceiveProgrammaticFocus(element)) {
    return false;
  }
  if (!element.matches(FOCUSABLE_SELECTOR)) {
    return false;
  }
  return true;
}

/** Returns whether focus can be moved to the element after the tour closes. */
export function canReceiveProgrammaticFocus(element: HTMLElement): boolean {
  if (!document.contains(element)) {
    return false;
  }
  if (element.closest('[inert]')) {
    return false;
  }
  if (element.matches(':disabled')) {
    return false;
  }
  const style = window.getComputedStyle(element);
  if (style.visibility === 'hidden' || style.display === 'none') {
    return false;
  }
  return true;
}

/** Restores focus when the prior target is still connected and not inert. */
export function restoreFocusSafely(element: HTMLElement | null) {
  if (element && canReceiveProgrammaticFocus(element)) {
    element.focus();
    return;
  }
  const root = document.getElementById('root');
  if (!root) {
    return;
  }
  const fallback = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).find(isFocusableElement);
  fallback?.focus();
}

/**
 * Defers focus restoration until after parent effects (e.g. `#root` inert) have cleared.
 * TourHost marks the app inert while the card is mounted; restore must run after cleanup.
 */
export function scheduleFocusRestore(element: HTMLElement | null) {
  requestAnimationFrame(function waitForParentCleanup() {
    requestAnimationFrame(function restoreDeferredFocus() {
      restoreFocusSafely(element);
    });
  });
}

/** Focus the tour card primary action, or fall back to the dialog container. */
export function focusTourCardEntry(card: HTMLElement) {
  const primary = card.querySelector<HTMLElement>('[data-tour-primary-action]');
  if (primary && isFocusableElement(primary)) {
    primary.focus();
    return;
  }
  card.focus();
}
