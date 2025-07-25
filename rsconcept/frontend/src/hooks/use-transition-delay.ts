import { useEffect, useState } from 'react';
import { useNavigation } from 'react-router';

const DEFAULT_DEBOUNCE_DELAY = 100; // ms

/**
 * Tracks whether a route transition is in progress, even if data is cached or rendering takes time.
 * Adds an optional debounce to avoid flashing the loader.
 *
 * @param delay Optional debounce delay in milliseconds before showing the loader.
 * @returns `true` if a transition is in progress (after debounce), `false` otherwise.
 */
export function useTransitionTracker(delay: number = DEFAULT_DEBOUNCE_DELAY): boolean {
  const navigation = useNavigation();
  const [showPending, setShowPending] = useState<boolean>(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    if (navigation.location) {
      timeout = setTimeout(() => setShowPending(true), delay);
    } else {
      setShowPending(false);
      if (timeout) {
        clearTimeout(timeout);
      }
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [navigation.location, delay]);

  return showPending;
}
