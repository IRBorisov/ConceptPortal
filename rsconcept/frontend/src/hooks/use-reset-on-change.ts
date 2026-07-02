import { useEffect, useEffectEvent, useMemo } from 'react';

/**
 * Invokes a reset callback whenever dependency values change (deep-compared via JSON).
 *
 * @param deps - Values that trigger {@link resetFn} when any change.
 * @param resetFn - Callback to run on dependency change.
 */
export function useResetOnChange<T>(deps: T[], resetFn: () => void) {
  const depsKey = useMemo(() => JSON.stringify(deps), [deps]);
  const onResetEvent = useEffectEvent(resetFn);
  useEffect(
    function resetOnChange() {
      onResetEvent();
    },
    [depsKey]
  );
}
