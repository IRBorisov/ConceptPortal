import { isFocusableElement } from './focus';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Collect focusable descendants from one or more roots in document order. */
export function collectFocusableRoots(roots: readonly HTMLElement[]): HTMLElement[] {
  const seen = new Set<HTMLElement>();
  const focusables: HTMLElement[] = [];
  for (const root of roots) {
    if (!root.isConnected) {
      continue;
    }
    const matches = root.matches(FOCUSABLE_SELECTOR) ? [root] : [];
    const descendants = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    for (const element of [...matches, ...descendants]) {
      if (seen.has(element) || !isFocusableElement(element)) {
        continue;
      }
      seen.add(element);
      focusables.push(element);
    }
  }
  return focusables;
}

function containsElement(root: HTMLElement, target: EventTarget | null): boolean {
  if (!target) {
    return false;
  }
  return root.contains(target as Node);
}

function isWithinAllowedRoots(roots: readonly HTMLElement[], target: EventTarget | null): boolean {
  return roots.some(root => containsElement(root, target));
}

function focusFirstAvailable(focusables: readonly HTMLElement[], fallback: HTMLElement) {
  const first = focusables.find(isFocusableElement);
  if (first) {
    first.focus();
    return;
  }
  fallback.focus();
}

export interface InteractFocusContainmentOptions {
  /** Roots that may receive focus (typically the tour card and interact region). */
  roots: HTMLElement[];
  /** Focus target when containment redirects an outside focus attempt. */
  fallbackRoot: HTMLElement;
}

/**
 * Keeps keyboard focus inside the tour card and declared interact region.
 * Returns a dispose function.
 */
export function installInteractFocusContainment(options: InteractFocusContainmentOptions): () => void {
  const connectedRoots = options.roots.filter(root => root.isConnected);
  if (connectedRoots.length === 0) {
    return function noopDispose() {
      /* no roots */
    };
  }

  function getFocusables() {
    return collectFocusableRoots(connectedRoots);
  }

  function redirectOutsideFocus() {
    const active = document.activeElement;
    if (isWithinAllowedRoots(connectedRoots, active)) {
      return;
    }
    focusFirstAvailable(getFocusables(), options.fallbackRoot);
  }

  function onFocusIn(event: FocusEvent) {
    if (isWithinAllowedRoots(connectedRoots, event.target)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    redirectOutsideFocus();
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Tab') {
      return;
    }
    const focusables = getFocusables();
    if (focusables.length === 0) {
      event.preventDefault();
      options.fallbackRoot.focus();
      return;
    }

    const active = document.activeElement;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const activeIndex = focusables.indexOf(active as HTMLElement);

    if (event.shiftKey) {
      if (activeIndex <= 0 || active === options.fallbackRoot) {
        event.preventDefault();
        last.focus();
      }
      return;
    }

    if (activeIndex === -1 || activeIndex === focusables.length - 1 || active === options.fallbackRoot) {
      event.preventDefault();
      first.focus();
    }
  }

  document.addEventListener('focusin', onFocusIn, true);
  document.addEventListener('keydown', onKeyDown, true);

  return function disposeInteractFocusContainment() {
    document.removeEventListener('focusin', onFocusIn, true);
    document.removeEventListener('keydown', onKeyDown, true);
  };
}
