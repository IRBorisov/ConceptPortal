import { useRef } from 'react';

export function useResetOnChange<T>(deps: T[], resetFn: () => void) {
  const lastDeps = useRef<string | null>(null);
  const currentDeps = JSON.stringify(deps);
  if (lastDeps.current !== currentDeps) {
    lastDeps.current = currentDeps;
    resetFn();
  }
}
